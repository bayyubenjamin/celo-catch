import React from "react";

// Definisikan props yang dibutuhkan dari useCeloCatch
type ProfileProps = {
  shortAccount: string;
  playerXp: number;
  equippedRod: number;
  ownedRods: Record<number, number>;
  ownedNfts: Record<number, number>;
  fishGuide: { type: number; emoji: string; name: string }[];
};

export default function Profile({
  shortAccount,
  playerXp,
  equippedRod,
  ownedRods,
  ownedNfts,
  fishGuide,
}: ProfileProps) {
  
  // Fungsi kecil untuk mengubah ID Pancingan jadi nama
  const getRodName = (id: number) => {
    if (id === 1) return "Basic Rod";
    if (id === 2) return "Pro Rod";
    if (id === 3) return "Legendary Rod";
    return "Tidak Diketahui";
  };

  // Hitung total NFT Ikan yang dimiliki
  const totalNftsOwned = Object.values(ownedNfts).reduce((sum, current) => sum + current, 0);

  return (
    <section className="action-card" style={{ padding: "30px 20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👤 Profil Pemancing</h2>

      {/* Info Dompet & XP */}
      <div style={{ background: "rgba(0,0,0,0.05)", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
        <p><strong>Wallet:</strong> {shortAccount}</p>
        <p><strong>Total XP (Milestone):</strong> {playerXp} XP</p>
        <p style={{ fontSize: "0.85em", color: "var(--muted)", marginTop: "5px" }}>
          *XP tidak akan berkurang saat Anda minting ikan.
        </p>
      </div>

      {/* Info Pancingan */}
      <div style={{ background: "rgba(0,0,0,0.05)", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "1.2em" }}>🎣 Alat Pancing</h3>
        <p>
          <strong>Sedang Dipakai:</strong> {equippedRod === 0 ? "Belum ada" : getRodName(equippedRod)}
        </p>
        
        <div style={{ marginTop: "10px" }}>
          <strong>Pancingan Dimiliki:</strong>
          <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
            {ownedRods[1] > 0 && <li>Basic Rod: {ownedRods[1]}x</li>}
            {ownedRods[2] > 0 && <li>Pro Rod: {ownedRods[2]}x</li>}
            {ownedRods[3] > 0 && <li>Legendary Rod: {ownedRods[3]}x</li>}
            {ownedRods[1] === 0 && ownedRods[2] === 0 && ownedRods[3] === 0 && (
              <li style={{ color: "var(--muted)" }}>Belum punya pancingan.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Info Koleksi Ikan (NFT) */}
      <div style={{ background: "rgba(0,0,0,0.05)", padding: "15px", borderRadius: "10px" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "1.2em" }}>🖼️ Koleksi NFT Ikan</h3>
        <p style={{ marginBottom: "10px" }}><strong>Total Dimiliki:</strong> {totalNftsOwned} ikan</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "10px" }}>
          {fishGuide.map((fish) => {
            const amount = ownedNfts[fish.type] || 0;
            return (
              <div 
                key={fish.type} 
                style={{ 
                  background: amount > 0 ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  textAlign: "center",
                  opacity: amount > 0 ? 1 : 0.5
                }}
              >
                <div style={{ fontSize: "2em" }}>{fish.emoji}</div>
                <div style={{ fontSize: "0.8em", fontWeight: "bold" }}>{fish.name}</div>
                <div style={{ fontSize: "0.9em", color: "var(--primary)" }}>{amount}x</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
