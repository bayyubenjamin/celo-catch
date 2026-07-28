"use client";
import { useCeloCatch } from "../hooks/useCeloCatch";
import Navbar from "./Navbar";
import Pond from "./Pond";
import Shop from "./Shop";
import Reward from "./Reward";
import Profile from "./Profile";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CeloCatchApp() {
  const celoCatch = useCeloCatch();
  
  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div><h1>Celo Catch</h1></div>
          <span className={`network-pill ${celoCatch.miniPay ? "is-minipay" : ""}`}>
            {celoCatch.miniPay ? "MiniPay" : celoCatch.appChain.name}
          </span>
          {!celoCatch.miniPay && <ConnectButton />}
        </header>

        <section className="pond-card" style={{ marginBottom: "24px" }}>
          <div className="pond-copy"><h2>One cast. One catch. Every day.</h2></div>
          <div className="pond-scene" aria-hidden="true">
            <div className="sun-dot"></div><div className="fishing-line"></div>
            <span className="hook">⌁</span><span className="fish fish-one">🐟</span>
            <span className="fish fish-two">🐠</span>
            <div className="water-line water-one"></div><div className="water-line water-two"></div>
          </div>
        </section>

        <Navbar activeTab={celoCatch.activeTab} setActiveTab={celoCatch.setActiveTab} />

        {celoCatch.activeTab === "pond" && <Pond {...celoCatch} />}
        {celoCatch.activeTab === "shop" && <Shop {...celoCatch} />}
        {celoCatch.activeTab === "nft" && <Shop {...celoCatch} />}
        {celoCatch.activeTab === "token" && <Reward {...celoCatch} />}
        
        {/* Update di baris ini: Meneruskan data dari celoCatch ke komponen Profile */}
        {celoCatch.activeTab === "profile" && <Profile {...celoCatch} />}

        <section className="action-card" style={{ marginTop: '20px' }}>
          <h2>Mainnet Ecosystem</h2>
          <dl className="wallet-summary">
            <div><dt>Core</dt><dd>{celoCatch.contractAddress?.slice(0, 8)}</dd></div>
            <div><dt>Rod</dt><dd>{celoCatch.rodAddress?.slice(0, 8)}</dd></div>
          </dl>
        </section>

        {/* Telegram Community Link */}
        <footer style={{ textAlign: "center", padding: "20px 0", marginTop: "10px" }}>
          <a 
            href="https://t.me/+urf3qEq3FkE2NDA1" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: "var(--muted)", 
              textDecoration: "none", 
              fontSize: "0.9rem", 
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Join Telegram Community
          </a>
        </footer>
      </div>
    </main>
  );
}
