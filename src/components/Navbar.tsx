import { TabState } from "../hooks/useCeloCatch";

export default function Navbar({ activeTab, setActiveTab }: { activeTab: TabState, setActiveTab: (t: TabState) => void }) {
  return (
    <div style={{ display: "flex", gap: "8px", background: "#fff", padding: "4px", borderRadius: "12px", marginBottom: "24px", overflowX: "auto" }}>
      <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'pond' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("pond")}>🎣 Pond</button>
      <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'shop' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("shop")}>⛺ Shop</button>
      <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'nft' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("nft")}>🖼️ NFT</button>
      <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'token' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("token")}>🎁 Reward</button>
      <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'profile' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("profile")}>👤</button>
    </div>
  );
}
