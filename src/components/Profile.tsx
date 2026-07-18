import React from "react";

type ProfileProps = {
  shortAccount: string;
  playerXp: number;
  equippedRod: number;
  ownedRods: Record<number, number>;
  ownedNfts: Record<number, number>; 
};

// Metadata khusus untuk ID 1 dan 3
const NFT_CONFIG: Record<number, { name: string; emoji: string; cost: number }> = {
  1: { name: "Tiny Fish", emoji: "🐟", cost: 150 },
  3: { name: "Puffer Fish", emoji: "🐡", cost: 2000 },
};

export default function Profile({
  shortAccount,
  playerXp,
  equippedRod,
  ownedRods,
  ownedNfts,
}: ProfileProps) {

  // Hitung XP Terpakai hanya dari ID 1 dan ID 3
  let usedXp = 0;
  [1, 3].forEach((id) => {
    const amount = ownedNfts[id] || 0;
    const cost = NFT_CONFIG[id].cost;
    usedXp += (amount * cost);
  });

  const remainingXp = Math.max(0, playerXp - usedXp);

  return (
    <section className="action-card" style={{ padding: "30px 20px" }}>
      <h2>👤 Profil Pemancing</h2>
      
      {/* Box XP dengan logika minting Anda */}
      <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "10px", margin: "10px 0" }}>
        <p><strong>Total XP (Didapat):</strong> {playerXp.toLocaleString()} XP</p>
        <p><strong>XP Terpakai (Mint):</strong> {usedXp.toLocaleString()} XP</p>
        <p style={{ color: "#2563eb", fontWeight: "bold" }}>Sisa XP (Bisa dipakai): {remainingXp.toLocaleString()} XP</p>
      </div>

      {/* Koleksi NFT (Hanya menampilkan ID 1 dan 3) */}
      <h3>🏆 Koleksi NFT Anda</h3>
      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        {[1, 3].map((id) => (
          <div key={id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", textAlign: "center", width: "120px" }}>
            <div style={{ fontSize: "2em" }}>{NFT_CONFIG[id].emoji}</div>
            <div style={{ fontSize: "0.9em", fontWeight: "bold" }}>{NFT_CONFIG[id].name}</div>
            <div style={{ fontSize: "0.8em" }}>{ownedNfts[id] || 0} Dimiliki</div>
          </div>
        ))}
      </div>
    </section>
  );
}
