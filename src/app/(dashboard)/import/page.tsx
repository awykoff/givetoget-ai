export default function ImportPage() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ background: "#18181D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "48px 40px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F0EEFF", margin: "0 0 8px" }}>Import contacts</h2>
        <p style={{ fontSize: "13px", color: "#8B87A8", lineHeight: 1.6, margin: 0 }}>
          The upload zone is coming next. You'll be able to drag-and-drop a CSV and earn 1 credit per unique new contact.
        </p>
      </div>
    </div>
  );
}
