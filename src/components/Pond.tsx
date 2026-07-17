export default function Pond(props: any) {
  return (
    <>
      <section className="action-card">
        <dl className="wallet-summary">
          <div><dt>Wallet</dt><dd>{props.shortAccount}</dd></div>
          <div><dt>Network</dt><dd>{props.isMainnet ? "Mainnet" : "Sepolia"}</dd></div>
          <div><dt>Your XP</dt><dd>{props.playerXp} XP</dd></div>
        </dl>
        <button className="cast-button" onClick={props.castLine} disabled={props.castDisabled}>{props.loading ? "Casting…" : "Cast line"}</button>
        <p className="status-copy">{props.status}</p>
      </section>
      {props.lastCatch && (
        <section className="catch-card" style={{ marginTop: '20px' }}>
          <div className="catch-emoji">{props.lastCatch.emoji}</div>
          <div><h2>{props.lastCatch.name}</h2><p className="catch-xp">+{props.lastCatch.xp} XP</p></div>
        </section>
      )}
      {props.leaders.length > 0 && (
        <section className="action-card" style={{ marginTop: '20px' }}>
          <h2>Leaderboard</h2>
          <div className="leader-list">
            {props.leaders.map((l: any, i: number) => (
              <div key={l.address} className="leader-row">
                <span className="rank">{i + 1}</span>
                <div className="leader-address"><strong>{l.address.slice(0, 6)}...{l.address.slice(-4)}</strong></div>
                <span className="leader-xp">{l.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
