export default function Shop(props: any) {
  return (
    <section className="action-card">
      {props.activeTab === "shop" ? (
        <>
          <h2>Rod Shop & Upgrades</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
            <ItemCard name="Basic Rod (ID: 1)" description="Free" primaryAction={() => props.buyRod(1, "0")} primaryLabel="Mint" secondaryAction={() => props.equipRod(1)} secondaryLabel="Equip" />
            <ItemCard name="Pro Rod (ID: 2)" description="5 CELO (+50 XP Bonus)" primaryAction={() => props.buyRod(2, "5")} primaryLabel="Mint" secondaryAction={() => props.equipRod(2)} secondaryLabel="Equip" />
            <ItemCard name="Legend Rod (ID: 3)" description="10 CELO (+200 XP Bonus)" primaryAction={() => props.buyRod(3, "10")} primaryLabel="Mint" secondaryAction={() => props.equipRod(3)} secondaryLabel="Equip" />
            <ItemCard name="Upgrade to Pro" description="Burn 3 Basic Rods" primaryAction={() => props.upgradeRod(1, 2)} primaryLabel="Upgrade" />
            <ItemCard name="Upgrade to Legend" description="Burn 3 Pro Rods" primaryAction={() => props.upgradeRod(2, 3)} primaryLabel="Upgrade" />
          </div>
        </>
      ) : (
        <>
          <h2>Mint Exclusive NFT</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <ItemCard name="Tiny Fish NFT (ID: 1)" description="Syarat: 150 XP" primaryAction={() => props.mintNft(1)} primaryLabel="Mint" />
            <ItemCard name="Puffer Fish NFT (ID: 3)" description="Syarat: 2000 XP" primaryAction={() => props.mintNft(3)} primaryLabel="Mint" />
          </div>
        </>
      )}
      <p className="status-copy" style={{ marginTop: "16px" }}>{props.status}</p>
    </section>
  );
}

function ItemCard({ name, description, primaryAction, primaryLabel, secondaryAction, secondaryLabel }: any) {
  return (
    <div style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "15px", background: "#fbfaf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div><strong>{name}</strong><br/><small style={{ color: "var(--muted)" }}>{description}</small></div>
      <div style={{ display: "flex", gap: "6px" }}>
        {primaryAction && <button onClick={primaryAction} className="text-button">{primaryLabel}</button>}
        {secondaryAction && <button onClick={secondaryAction} className="text-button">{secondaryLabel}</button>}
      </div>
    </div>
  );
}
