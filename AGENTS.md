# AGENTS.md — give-to-get.com

> This file is read by Ruflo (claude-flow) to define the agent swarm for the give-to-get.com project.
> Ruflo reads this alongside CLAUDE.md on every swarm initialization.
> All agents operate under the design system and conventions in CLAUDE.md.

---

## Swarm Architecture

```
                    ┌─────────────┐
                    │    QUEEN    │  coordinator
                    │  (givetoget)│  orchestrates, prevents drift
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │ARCHITECT│       │ FRONTEND  │     │ DATABASE  │
   │         │       │  (UI/UX)  │     │(Supabase) │
   └────┬────┘       └─────┬─────┘     └─────┬─────┘
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │ BACKEND │       │   AUTH    │     │  TESTER   │
   │(Edge Fn)│       │(Supabase) │     │           │
   └─────────┘       └───────────┘     └─────┬─────┘
                                             │
                                       ┌─────▼─────┐
                                       │   DOCS    │
                                       │(Obsidian) │
                                       └───────────┘
```

**Topology:** Hierarchical (Queen → Workers)
**Max agents:** 8
**Memory backend:** Hybrid (SQLite + in-memory)
**Coordination:** MCP via claude-flow

---

## Agent Definitions

### 1. QUEEN — Coordinator

```
Type:        coordinator
Name:        queen
Role:        Orchestrates all agents, maintains spec compliance, resolves conflicts
```

**Responsibilities:**
- Reads `CLAUDE.md` and `AGENTS.md` on startup
- Decomposes features into tasks and assigns to workers
- Prevents implementation drift from the design system
- Reaches consensus when agents produce conflicting outputs
- Monitors progress and re-routes blocked tasks

**Rules:**
- NEVER writes code directly — delegates to specialist agents
- ALWAYS validate output against `CLAUDE.md` design tokens before accepting
- If any agent produces a light background color, reject and re-assign
- Enforce dark theme: bg `#0C0C0F`, accent `#8B5CF6` on all outputs

**Memory keys to maintain:**
```
queen:task-queue        → active task list
queen:completed         → finished features
queen:drift-log         → design violations caught and corrected
queen:agent-status      → health of each worker
```

---

### 2. ARCHITECT — System Design

```
Type:        architect
Name:        architect
Role:        Next.js 15 app structure, routing, API design, ADRs
```

**Reads:**
- `CLAUDE.md` → Tech stack, deployment, file structure
- `src/` → existing codebase
- `supabase/migrations/` → schema

**Builds:**
- `app/` directory structure (Next.js 15 App Router)
- Route definitions (`/`, `/contacts`, `/import`, `/credits`, `/settings`)
- API route stubs (`app/api/export/route.ts`, `app/api/webhooks/stripe/route.ts`)
- `lib/` structure (supabase client, types, utils)
- Architecture Decision Records in `docs/adr/`

**Output rules:**
- Use App Router — no Pages Router
- All routes TypeScript (`.tsx`, `.ts`)
- Co-locate components with routes where sensible
- `src/components/` for shared components only

---

### 3. FRONTEND — UI / Components

```
Type:        coder
Name:        frontend
Role:        React components, dark theme, DM Sans, Tailwind v4
```

**Reads:**
- `CLAUDE.md` → Design system, CSS classes, layout tokens
- `src/components/Dashboard.jsx` → existing prototype (reference)
- `40-Design/Component Library.md` → component specs
- `40-Design/Design Tokens.md` → color object `C{}`
- `40-Design/Screen Inventory.md` → all 6 screens

**Builds:**
- `components/layout/Sidebar.tsx` — 224px, `#111115`, active nav state
- `components/layout/TopBar.tsx` — 52px, credits pill, export button
- `components/dashboard/StatCard.tsx` — dark card, eyebrow label
- `components/contacts/ContactsTable.tsx` — sticky header, purple hover
- `components/contacts/FilterPanel.tsx` — vertical/seniority checkboxes
- `components/contacts/ExportModal.tsx` — format picker, field grid
- `components/import/UploadZone.tsx` — drag-drop, idle/dragover/hasFile states
- `components/import/ImportReview.tsx` — new vs duplicate preview
- `components/credits/CreditBalance.tsx` — gradient card, 38px stat
- `components/credits/TransactionHistory.tsx` — earn/spend rows
- `components/ui/` — Button, Card, Badge, Modal, VBadge

**Hard rules — NEVER violate:**
- Background: `#0C0C0F` — NEVER use white or light backgrounds
- Accent: `#8B5CF6` — NEVER use another accent color
- Font: DM Sans — import from Google Fonts
- Borders: `rgba(255,255,255,0.07)` — ghost borders only, no solid borders
- No drop shadows on cards
- Table rows 40px height, purple tint on hover

---

### 4. DATABASE — Supabase Schema

```
Type:        coder
Name:        database
Role:        Postgres migrations, RLS policies, triggers, views
```

**Reads:**
- `CLAUDE.md` → Supabase project details
- `supabase/migrations/001_initial_schema.sql` → existing schema
- `30-Technical/Supabase Schema.md` → full schema spec

**Builds:**
- `supabase/migrations/` — numbered SQL migration files
- `lib/types/database.types.ts` — generated from schema
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — RSC server client
- `middleware.ts` — session refresh

**Schema tables (already defined in migration 001):**
```
workspaces, workspace_members, contacts, imports, exports,
export_contacts, credits_ledger, workspace_contact_access
```

**Key rules:**
- Credits ledger is APPEND-ONLY — never UPDATE or DELETE rows
- `email_normalized` is the global dedup key — always case-insensitive trimmed
- RLS must be enabled on ALL tables
- All credit mutations via triggers — NEVER direct inserts from client

---

### 5. BACKEND — Edge Functions

```
Type:        coder
Name:        backend
Role:        Supabase Edge Functions (Deno), import processing, export generation
```

**Reads:**
- `CLAUDE.md` → Tech stack
- `30-Technical/API Reference.md` → full Edge Function implementations
- `supabase/migrations/001_initial_schema.sql` → table structures

**Builds:**
- `supabase/functions/import-processor/index.ts` — CSV parse, dedup, insert, credit earn
- `supabase/functions/export-generator/index.ts` — fetch contacts, generate file, upload, unlock
- `supabase/functions/_shared/cors.ts` — shared CORS headers
- `supabase/functions/_shared/supabase.ts` — service role client
- `app/api/export/route.ts` — Next.js API route triggering Edge Function

**Import processor rules:**
- Reject personal email domains (gmail, yahoo, hotmail, outlook, etc.)
- Batch dedup in single SQL query — never loop per-contact
- Chunk inserts at 500 rows maximum
- `normalizeSeniority()` from title string
- Update `imports` table → trigger fires → credits earned

**Export generator rules:**
- Service role only — never expose email without credit spend
- Insert `workspace_contact_access` rows after export
- Generate signed storage URL (1 hour expiry)
- Support CSV, XLSX, JSON formats

---

### 6. AUTH — Authentication

```
Type:        coder
Name:        auth
Role:        Supabase Auth, Google OAuth, workspace creation, middleware
```

**Reads:**
- `CLAUDE.md` → Tech stack, auth patterns
- `30-Technical/Tech Stack.md` → full auth setup

**Builds:**
- `app/(auth)/login/page.tsx` — email + Google SSO, dark theme
- `app/(auth)/signup/page.tsx` — email signup, dark theme
- `app/(auth)/callback/route.ts` — OAuth callback handler
- `middleware.ts` — session refresh, route protection
- `app/(dashboard)/layout.tsx` — auth guard, sidebar/topbar wrapper
- Workspace creation flow on first login

**Auth rules:**
- Dark theme on all auth pages: `#0C0C0F` bg, `#8B5CF6` button
- Google OAuth as primary CTA
- Redirect unauthenticated users to `/login`
- On first login: create workspace, insert 100 bonus credits

---

### 7. TESTER — Quality Assurance

```
Type:        tester
Name:        tester
Role:        Unit tests, RLS policy tests, E2E flows, import/export validation
```

**Reads:**
- `CLAUDE.md` → All specs
- `20-Product/Product Spec.md` → user flows, business rules

**Builds:**
- `__tests__/` — unit tests for utility functions
- `__tests__/rls/` — RLS policy validation tests
- `__tests__/import/` — CSV parsing, dedup logic, credit calculation
- `__tests__/credits/` — ledger balance, trigger correctness
- `e2e/` — Playwright tests for critical user flows

**Critical test cases:**
- Import: personal email domain rejection
- Import: duplicate detection (exact email match, case-insensitive)
- Import: credit earn = new contacts inserted (not total rows)
- Export: credit deduction = contacts selected
- Credits: ledger append-only (UPDATE/DELETE must fail)
- RLS: workspace A cannot read workspace B's imports/exports
- Credits: insufficient balance blocks export

---

### 8. DOCS — Documentation

```
Type:        coder
Name:        docs
Role:        Keep Obsidian vault in sync with implementation, update CLAUDE.md
```

**Reads:**
- All vault notes
- Completed agent outputs

**Builds / Updates:**
- `CLAUDE.md` — update with new routes, components, and patterns as built
- `40-Design/Generated HTML.md` — paste exported HTML when available
- `40-Design/Screen Inventory.md` — update as screens are built
- `supabase/migrations/` — add migration notes to Supabase Schema vault note
- `README.md` — keep in sync with actual project state

---

## Initialization Commands

```bash
# Install Ruflo
npx claude-flow@v3alpha init --wizard

# Start daemon
npx claude-flow@v3alpha daemon start

# Add to Claude Code via MCP
claude mcp add claude-flow npx claude-flow@v3alpha mcp start

# Initialize swarm
npx claude-flow@v3alpha swarm init --topology hierarchical --max-agents 8

# Spawn all agents (run as one batch)
npx claude-flow@v3alpha agent spawn --type coordinator --name queen
npx claude-flow@v3alpha agent spawn --type architect   --name architect
npx claude-flow@v3alpha agent spawn --type coder       --name frontend
npx claude-flow@v3alpha agent spawn --type coder       --name database
npx claude-flow@v3alpha agent spawn --type coder       --name backend
npx claude-flow@v3alpha agent spawn --type coder       --name auth
npx claude-flow@v3alpha agent spawn --type tester      --name tester
npx claude-flow@v3alpha agent spawn --type coder       --name docs

# Start swarm with objective
npx claude-flow@v3alpha swarm start \
  --objective "Build give-to-get.com: a B2B contact database exchange. Read CLAUDE.md and AGENTS.md for full spec. Start with auth + dashboard layout, then contacts page, then import flow, then credits." \
  --strategy development
```

---

## Feature Delivery Order (Queen's Task Queue)

The Queen should sequence work in this order to minimize blocked dependencies:

```
Phase 1 — Foundation
  1. Architect: scaffold Next.js 15 app structure
  2. Database: apply migrations, generate types
  3. Auth: login/signup pages + middleware

Phase 2 — Core Screens
  4. Frontend: Sidebar + TopBar layout components
  5. Frontend: Dashboard page (stat cards, recent imports, vertical chart)
  6. Frontend: Credits page (balance card, transaction history)

Phase 3 — Import Pipeline
  7. Backend: import-processor Edge Function
  8. Frontend: Import upload zone + review screen
  9. Tester: import flow tests

Phase 4 — Contact Exchange
  10. Frontend: Contacts table + filter panel
  11. Frontend: Export modal
  12. Backend: export-generator Edge Function
  13. Tester: export + RLS tests

Phase 5 — Polish
  14. Frontend: Mobile responsive passes
  15. Docs: sync Obsidian vault with built state
  16. Tester: E2E Playwright suite
```

---

## Memory Keys Convention

All agents store and retrieve shared memory using these key prefixes:

```
queen:*         → orchestration state
arch:*          → architecture decisions
frontend:*      → component inventory
db:*            → schema state
backend:*       → edge function status
auth:*          → auth flow state
tester:*        → test results
docs:*          → documentation state
shared:design   → validated design token snapshot
shared:schema   → validated schema snapshot
```

---

## Do Not (All Agents)

- NEVER use light backgrounds — all surfaces must be dark
- NEVER break the credits ledger (append-only)
- NEVER expose contact email without credit deduction
- NEVER commit `.DS_Store` files
- NEVER use `<form>` tags in React — use event handlers
- NEVER use light-mode Tailwind defaults — always override
- NEVER skip RLS on any new table
- NEVER UPDATE or DELETE credits_ledger rows
