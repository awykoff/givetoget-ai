# CLAUDE.md — give-to-get.com

> This file is read automatically by Claude Code on every session.
> It defines the full project context, design system, conventions, and rules.

---

## Project Overview

**give-to-get.com** is a B2B SaaS contact database exchange.
- Upload a CSV of B2B contacts → earn 1 credit per unique new contact
- Spend credits to download contacts filtered by vertical, seniority, location, company size
- **Tagline:** Give contacts. Get contacts.
- **Stage:** MVP v1
- **Owner:** Aaron Wykoff / A. Wykoff Consulting

**GitHub:** https://github.com/awykoff/give-to-get.com
**Vercel:** give-to-get.com.vercel.app (connected to main branch)
**Claude Design:** https://claude.ai/design/p/f96ac40b-bae7-432e-a9fe-599c7b99b493

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Auth | Supabase Auth — email + Google OAuth |
| Database | Supabase (Postgres 15) + RLS + triggers |
| Storage | Supabase Storage (CSV uploads, export files) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Orchestration | Ruflo (claude-flow v3) — MCP on port 3000 |
| Font | DM Sans (Google Fonts) |
| Hosting | Vercel (Hobby → Pro at launch) |

---

## Design System

### Color Object

```javascript
const C = {
  bg:           "#0C0C0F",
  sidebar:      "#111115",
  surface:      "#18181D",
  surfaceHover: "#1E1E25",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,255,255,0.13)",
  borderAccent: "rgba(139,92,246,0.35)",
  text:         "#F0EEFF",
  muted:        "#8B87A8",
  subtle:       "#4E4A66",
  accent:       "#8B5CF6",
  accentHover:  "#9D71FA",
  accentLight:  "rgba(139,92,246,0.12)",
  accentText:   "#C4B5FD",
  accentDark:   "#7C3AED",
  success:      "#34D399",
  successLight: "rgba(52,211,153,0.12)",
  successText:  "#6EE7B7",
  danger:       "#F87171",
  dangerLight:  "rgba(248,113,113,0.10)",
  warn:         "#FBBF24",
  warnLight:    "rgba(251,191,36,0.10)",
  warnText:     "#FDE68A",
}
```

### Typography

```
Font:       DM Sans (Google Fonts)
Import:     https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap
Fallback:   -apple-system, BlinkMacSystemFont, sans-serif

Display:    38px, 700 weight
Page H1:    22px, 700 weight
Card H2:    16px, 700 weight
Eyebrow:    10px, 700, uppercase, 0.08em letter-spacing, color #4E4A66
Body:       13px, 400 weight
Body bold:  13px, 600 weight
Caption:    11px, 400 weight
Badge:      11px, 600 weight
```

### Layout Tokens

```
Sidebar width:    224px
Top bar height:   52px
Page padding:     24px
Card radius:      10px
Button radius:    7px
Badge radius:     5px
Modal radius:     14px
Card grid gap:    10–12px
```

### Global CSS

```css
* { box-sizing: border-box; }
body {
  background: #0C0C0F;
  color: #F0EEFF;
  font-family: 'DM Sans', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 3px; }
::placeholder { color: #4E4A66; }
input:focus, textarea:focus {
  outline: none;
  border-color: rgba(139,92,246,0.5) !important;
  box-shadow: 0 0 0 2px rgba(139,92,246,0.12);
}
```

---

## Component Rules

### Sidebar
- Width: 224px, background: `#111115`
- Active nav item: `rgba(139,92,246,0.12)` bg + `#C4B5FD` text + 3px purple left border
- Nav icons: 16px, muted color inactive, accentText active
- Logo: G mark at 28px height + "give-to-get.com" wordmark

### Top Bar
- Height: 52px, background: `#111115`
- Credits pill: `rgba(139,92,246,0.12)` bg, purple Zap icon, `#C4B5FD` text
- Export button: primary purple, right-aligned

### Cards
- Background: `#18181D`
- Border: `1px solid rgba(255,255,255,0.07)`
- Border-radius: 10px
- NO drop shadows
- Hover border: `rgba(255,255,255,0.13)`

### Buttons
- Primary: `background #8B5CF6`, white text, 7px radius
- Ghost: transparent + `rgba(255,255,255,0.07)` border, white text
- Danger: `rgba(248,113,113,0.15)` bg, `#F87171` text
- All buttons: DM Sans 600 weight, 13px

### Tables
- Row height: 40px minimum
- Header: 10px, 700, uppercase, `#4E4A66`, sticky
- Row hover: `rgba(139,92,246,0.04)` bg
- Row selected: `rgba(139,92,246,0.06)` bg
- Checkbox: purple accent when checked

### Vertical Badges

```javascript
const VERTICAL_COLORS = {
  SaaS:         { bg: "rgba(139,92,246,0.18)",  text: "#C4B5FD" },
  FinTech:      { bg: "rgba(52,211,153,0.15)",  text: "#6EE7B7" },
  MarTech:      { bg: "rgba(251,191,36,0.15)",  text: "#FDE68A" },
  "Data & AI":  { bg: "rgba(96,165,250,0.15)",  text: "#93C5FD" },
  HRTech:       { bg: "rgba(248,113,113,0.15)", text: "#FCA5A5" },
  HealthTech:   { bg: "rgba(52,211,153,0.12)",  text: "#6EE7B7" },
  Other:        { bg: "rgba(255,255,255,0.07)", text: "#8B87A8" },
}
```

### Import Status Badges
- `+ new`:  `rgba(52,211,153,0.15)` bg, `#6EE7B7` text
- `dedup`:  `rgba(255,255,255,0.07)` bg, `#8B87A8` text
- `invalid`: `rgba(248,113,113,0.10)` bg, `#F87171` text

---

## File Structure

```
give-to-get.com/
├── CLAUDE.md                    ← this file
├── AGENTS.md                    ← Ruflo swarm definitions
├── PRD.md                       ← Product Requirements Document
├── README.md
├── src/
│   ├── app/                     ← Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       ← sidebar + topbar wrapper
│   │   │   ├── page.tsx         ← dashboard home
│   │   │   ├── contacts/page.tsx
│   │   │   ├── import/page.tsx
│   │   │   └── credits/page.tsx
│   │   ├── api/
│   │   │   └── import/
│   │   │       └── apollo/route.ts  ← Apollo script endpoint
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── dashboard/
│   │   │   └── StatCard.tsx
│   │   ├── contacts/
│   │   │   ├── ContactsTable.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── ExportModal.tsx
│   │   ├── import/
│   │   │   ├── UploadZone.tsx
│   │   │   └── ImportReview.tsx
│   │   ├── credits/
│   │   │   ├── CreditBalance.tsx
│   │   │   └── TransactionHistory.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── VBadge.tsx
│   │   └── Dashboard.jsx        ← full prototype (6 screens)
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   └── server.ts
│       └── types/
│           └── database.types.ts
├── supabase/
│   ├── functions/
│   │   ├── import-processor/
│   │   └── export-generator/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_apollo_aligned_schema.sql  ← USE THIS ONE
├── scripts/
│   └── apollo-to-givetoget.ts   ← Apollo contributor script
├── public/
│   └── images/
│       ├── logo-white.png
│       ├── gmark-white.png
│       └── logo-purple.png
└── design/
    └── design-system.md
```

---

## Database (Supabase)

### Tables
```
workspaces              — workspace/team accounts
workspace_members       — users within workspaces (admin/member)
companies               — Apollo-aligned company records
contacts                — global shared contact pool (Apollo-aligned, 60+ fields)
imports                 — CSV import history
exports                 — export history + download links
export_contacts         — junction: which contacts per export
credits_ledger          — APPEND-ONLY transaction log
workspace_contact_access — which contacts a workspace has unlocked
```

### Critical Rules
- `credits_ledger` is **append-only** — NEVER UPDATE or DELETE
- `email_normalized` = LOWER(TRIM(email)) — global dedup key
- Contact email **never returned** without credit unlock or own contribution
- RLS enabled on **all tables**
- Credit earn/spend via **DB triggers only** — never direct client inserts
- Personal email domains **rejected** on import

### Migration to Run
```
supabase/migrations/002_apollo_aligned_schema.sql
```
Run this in Supabase SQL Editor on a fresh project. It includes everything.

---

## Environment Variables

```bash
# Required in Vercel + local .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Agent Swarm (Ruflo)

8 agents orchestrated by Ruflo (claude-flow v3), MCP running on port 3000:

| Agent | Type | Builds |
|---|---|---|
| Queen | coordinator | Orchestrates, prevents drift |
| Architect | architect | Next.js structure, routing, ADRs |
| Frontend | coder | All React components + dark theme |
| Database | coder | Migrations, RLS, triggers |
| Backend | coder | Edge Functions (import + export) |
| Auth | coder | Supabase Auth, Google OAuth |
| Tester | tester | Unit, RLS, E2E tests |
| Docs | coder | Keeps vault + CLAUDE.md in sync |

See `AGENTS.md` for full definitions and launch commands.

### Phase Delivery Order
```
Phase 1: Architect scaffold + Database migration + Auth pages
Phase 2: Sidebar + TopBar + Dashboard + Credits pages
Phase 3: Import Edge Function + Upload zone + Review screen
Phase 4: Contacts table + Filter panel + Export modal + Export Edge Function
Phase 5: Mobile responsive + E2E tests + Vault sync
```

---

## Logo Assets

```
public/images/logo-white.png     — white on transparent (nav, dark bg)
public/images/gmark-white.png    — G mark only (sidebar, favicon)
public/images/logo-purple.png    — purple on transparent (light bg)
```

Logo colors: gradient `#4f01bc` → `#3a0189`

---

## Apollo Integration

**Contributor script:** `scripts/apollo-to-givetoget.ts`
- Pulls user's existing saved contacts (zero Apollo credits)
- Filters personal domains, normalizes seniority
- POSTs to `POST /api/import/apollo`
- Users earn 1 credit per unique new contact

**Apollo column mapping:** All 65+ Contact fields + 37 Company fields mapped to schema.
See `supabase/migrations/002_apollo_aligned_schema.sql` comments for full mapping.

---

## Do Not

- ❌ NEVER use light or white backgrounds — all surfaces dark
- ❌ NEVER use any accent color other than `#8B5CF6`
- ❌ NEVER add drop shadows to cards
- ❌ NEVER use solid color borders — always rgba ghost borders
- ❌ NEVER UPDATE or DELETE `credits_ledger` rows
- ❌ NEVER expose contact email without credit deduction
- ❌ NEVER skip RLS on new tables
- ❌ NEVER use `<form>` tags in React — use onClick handlers
- ❌ NEVER commit `.DS_Store` files
- ❌ NEVER use Pages Router — App Router only
