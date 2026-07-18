import React from "react";

type ProfileProps = {
  shortAccount: string;
  playerXp: number;
  equippedRod: number;
  ownedRods: Record<number, number>;
  ownedNfts: Record<number, number>;
  fishGuide: { type: number; emoji: string; name: string }[];
};

// --- KONFIGURASI HARGA (BIAYA XP) UNTUK MINT SETIAP NFT ---
// Silakan sesuaikan angka-angka ini dengan harga asli di game Anda
const NFT_COSTS: Record<number, number> = {
  1: 150,    // Harga mint Ikan Tipe 1 (Tiny)
  2: 500,    // Harga mint Ikan Tipe 2 (Blue) -> Ganti jika beda
  3: 2000,   // Harga mint Ikan Tipe 3 (Puffer)
  4: 5000,   // Harga mint Ikan Tipe 4 (Golden) -> Ganti jika beda
  5: 10000,  // Harga mint Ikan Tipe 5 (Shark) -> Ganti jika beda
  6: 25000,  // Harga mint Ikan Tipe 6 (Whale) -> Ganti jika beda
};

export default function Profile({
  shortAccount,
  playerXp,
  equippedRod,
  ownedRods,
  ownedNfts,
  fishGuide,
}: ProfileProps) {
  
  const getRodName = (id: number) => {
    if (id === 1) return "Basic Rod";
    if (id === 2) return "Pro Rod";
    if (id === 3) return "Legendary Rod";
    return "Tidak Diketahui";
  };

  // --- PERHITUNGAN MATEMATIS XP ---
  const totalNftsOwned = Object.values(ownedNfts).reduce((sum, current) => sum + current, 0);
  
  // 1. Menghitung Total XP Terpakai
  let usedXp = 0;
  Object.keys(ownedNfts).forEach((idStr) => {
    const id = parseInt(idStr);
    const amount = ownedNfts[id] || 0;
    const cost = NFT_COSTS[id] || 0;
    usedXp += (amount * cost);
  });

  // 2. Menghitung Sisa XP (Math.max digunakan agar tidak minus jika ada anomali data)
  const remainingXp = Math.max(0, playerXp - usedXp);

  return (
    <section className="action-card" style={{ padding: "30px 20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👤 Profil Pemancing</h2>

      {/* Info Dompet & XP (Sekarang dengan Kalkulasi Matematis) */}
      <div style={{ background: "rgba(0,0,0,0.05)", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
        <p style={{ marginBottom: "10px" }}><strong>Wallet:</strong> {shortAccount}</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "4px" }}>
            <span>Total XP Keseluruhan:</span>
            <strong>{playerXp} XP</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "4px", color: "var(--muted)" }}>
            <span>XP Terpakai (Mint NFT):</span>
            <strong>- {usedXp} XP</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary)", fontSize: "1.1em", marginTop: "4px" }}>
            <span><strong>Sisa XP:</strong></span>
            <strong>{remainingXp} XP</strong>
          </div>
        </div>
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
