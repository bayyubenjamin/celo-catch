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
      </div>
    </main>
  );
}
