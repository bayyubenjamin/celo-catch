export default function Reward(props: any) {
  return (
    <section className="action-card">
      <h2>Claim $CATCH Token</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "15px", background: "#fbfaf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><strong>Reward Tiny Fish (ID: 1)</strong><br/><small style={{ color: "var(--muted)" }}>Butuh: Tiny Fish NFT</small></div>
          <button onClick={() => props.claimToken(1)} className="text-button">Claim</button>
        </div>
        <div style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "15px", background: "#fbfaf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><strong>Reward Puffer Fish (ID: 3)</strong><br/><small style={{ color: "var(--muted)" }}>Butuh: Puffer Fish NFT</small></div>
          <button onClick={() => props.claimToken(3)} className="text-button">Claim</button>
        </div>
      </div>
      <p className="status-copy" style={{ marginTop: "16px" }}>{props.status}</p>
    </section>
  );
}
