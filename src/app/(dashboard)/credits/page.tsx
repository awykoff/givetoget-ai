export default function CreditsPage() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ background: "#18181D", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "48px 40px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F0EEFF", margin: "0 0 8px" }}>Credits &amp; transactions</h2>
        <p style={{ fontSize: "13px", color: "#8B87A8", lineHeight: 1.6, margin: 0 }}>
          Credit balance and full transaction history coming next. Credits are earned on import and spent on export — they never expire.
        </p>
      </div>
    </div>
  );
}
