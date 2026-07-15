"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseError,
  createWalletClient,
  custom,
  decodeEventLog,
  parseEther,
  type Address,
  type Hash,
} from "viem";
import { 
  appChain, 
  contractAddress, 
  isMainnet, 
  rpcUrl,
  rodAddress,
  nftAddress,
  tokenAddress 
} from "@/lib/config";
import { loadGameSnapshot, publicClient, type LeaderboardEntry } from "@/lib/celo";
import { celoCatchAbi, fishingRodAbi } from "@/lib/contract";
import {
  ensureExpectedChain,
  getInjectedProvider,
  isMiniPayProvider,
  requestPrimaryAccount,
  type Eip1193Provider,
} from "@/lib/ethereum";

type WalletPhase = "checking" | "ready" | "missing" | "error";
type TabState = "pond" | "shop";

type CatchResult = {
  fishType: number;
  name: string;
  emoji: string;
  xp: number;
};

const fishGuide = [
  { type: 1, emoji: "🐟", name: "Tiny", xp: 10 },
  { type: 2, emoji: "🐠", name: "Blue", xp: 25 },
  { type: 3, emoji: "🐡", name: "Puffer", xp: 75 },
  { type: 4, emoji: "✨", name: "Golden", xp: 150 },
  { type: 5, emoji: "🦈", name: "Shark", xp: 350 },
  { type: 6, emoji: "🐋", name: "Whale", xp: 1000 },
];

export default function CeloCatchApp() {
  const providerRef = useRef<Eip1193Provider | null>(null);
  const [walletPhase, setWalletPhase] = useState<WalletPhase>("checking");
  const [account, setAccount] = useState<Address | null>(null);
  const [miniPay, setMiniPay] = useState(false);
  const [status, setStatus] = useState("Checking your MiniPay wallet…");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [canCast, setCanCast] = useState(false);
  const [totalCasts, setTotalCasts] = useState(0);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [activeTab, setActiveTab] = useState<TabState>("pond");

  const configured = contractAddress !== null;
  const explorerUrl = appChain.blockExplorers?.default.url;

  const shortAccount = useMemo(
    () => (account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "—"),
    [account],
  );

  const refreshGame = useCallback(async (player?: Address | null) => {
    if (!configured) {
      setTotalCasts(0);
      setCanCast(false);
      setLeaders([]);
      return;
    }
    setRefreshing(true);
    try {
      const snapshot = await loadGameSnapshot(player ?? undefined);
      setTotalCasts(snapshot.totalCasts);
      setCanCast(snapshot.canCast);
      setLeaders(snapshot.leaders);
    } catch (error) {
      console.error(error);
      setStatus("Celo data is temporarily unavailable.");
    } finally {
      setRefreshing(false);
    }
  }, [configured]);

  const connectInjectedWallet = useCallback(async () => {
    const provider = getInjectedProvider();
    providerRef.current = provider;
    if (!provider) {
      setWalletPhase("missing");
      setStatus("Open Celo Catch from the MiniPay app to start fishing.");
      return;
    }
    setMiniPay(isMiniPayProvider(provider));
    setWalletPhase("checking");
    try {
      const address = await requestPrimaryAccount(provider);
      await ensureExpectedChain(provider, appChain, rpcUrl);
      setAccount(address);
      setWalletPhase("ready");
      setStatus(configured ? "Your daily cast is ready." : "Wallet ready. Contract not deployed.");
      await refreshGame(address);
    } catch (error) {
      setAccount(null);
      setWalletPhase("error");
      setStatus(readableError(error));
    }
  }, [configured, refreshGame]);

  useEffect(() => {
    void connectInjectedWallet();
  }, [connectInjectedWallet]);

  async function buyRod(id: number, priceCelo: string) {
    if (!providerRef.current || !account || !rodAddress) return;
    setLoading(true);
    setTransactionHash(null);
    setStatus(`Minting Rod...`);
    try {
      await ensureExpectedChain(providerRef.current, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const hash = await walletClient.writeContract({
        address: rodAddress,
        abi: fishingRodAbi,
        functionName: "buyRod",
        args: [BigInt(id)],
        value: parseEther(priceCelo)
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rod minted!");
    } catch (error) { setStatus(readableError(error)); } finally { setLoading(false); }
  }

  async function equipRod(id: number) {
    if (!providerRef.current || !account || !contractAddress) return;
    setLoading(true);
    try {
      await ensureExpectedChain(providerRef.current, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: celoCatchAbi,
        functionName: "equipRod",
        args: [BigInt(id)],
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rod equipped!");
    } catch (error) { setStatus(readableError(error)); } finally { setLoading(false); }
  }

  async function castLine() {
    const provider = providerRef.current;
    if (!provider || !account || !contractAddress || !canCast) return;
    setLoading(true);
    try {
      await ensureExpectedChain(provider, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(provider) });
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: celoCatchAbi,
        functionName: "recordCatch",
      });
      setTransactionHash(hash);
      setStatus("Recording on Celo…");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let caughtFishType = 1;
      let caughtXp = 10;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({ abi: celoCatchAbi, data: log.data, topics: log.topics });
          if (decoded.eventName === "FishCaught") {
            const args = decoded.args as any;
            caughtFishType = Number(args.fishType);
            caughtXp = Number(args.xp);
          }
        } catch (e) {}
      }
      const caughtFishInfo = fishGuide.find((f) => f.type === caughtFishType) || fishGuide[0];
      setLastCatch({ fishType: caughtFishType, name: caughtFishInfo.name, emoji: caughtFishInfo.emoji, xp: caughtXp });
      setStatus("Catch recorded!");
      await refreshGame(account);
    } catch (error) { setStatus(readableError(error)); } finally { setLoading(false); }
  }

  const castDisabled = loading || walletPhase !== "ready" || !account || !configured || !canCast;

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div><h1>Celo Catch</h1></div>
          <span className={`network-pill ${miniPay ? "is-minipay" : ""}`}>{miniPay ? "MiniPay" : appChain.name}</span>
        </header>

        <div style={{ display: "flex", gap: "8px", background: "#fff", padding: "4px", borderRadius: "12px", marginBottom: "24px" }}>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'pond' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("pond")}>🎣 Pond</button>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'shop' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("shop")}>⛺ Shop</button>
        </div>

        {activeTab === "pond" && (
          <>
            <section className="pond-card">
              <h2>One cast. One catch. Every day.</h2>
              <div className="pond-scene"><span className="hook">⌁</span></div>
            </section>
            <section className="action-card">
              <dl className="wallet-summary">
                <div><dt>Wallet</dt><dd>{shortAccount}</dd></div>
                <div><dt>Network</dt><dd>{isMainnet ? "Mainnet" : "Sepolia"}</dd></div>
              </dl>
              <button className="cast-button" onClick={castLine} disabled={castDisabled}>{loading ? "Casting…" : "Cast line"}</button>
              <p className="status-copy">{status}</p>
            </section>
            {lastCatch && <section className="catch-card"><h2>{lastCatch.emoji} {lastCatch.name}</h2><p>+{lastCatch.xp} XP</p></section>}
          </>
        )}

        {activeTab === "shop" && (
          <section className="action-card">
            <h2>Rod Shop</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <RodItem name="Basic" price="Free" onBuy={() => buyRod(1, "0")} onEquip={() => equipRod(1)} />
              <RodItem name="Pro" price="5 CELO" onBuy={() => buyRod(2, "5")} onEquip={() => equipRod(2)} />
            </div>
            <p className="status-copy">{status}</p>
          </section>
        )}

        <section className="action-card" style={{ marginTop: '20px' }}>
          <h2>Mainnet Ecosystem</h2>
          <dl className="wallet-summary">
            <div><dt>Core</dt><dd>{contractAddress?.slice(0, 8)}</dd></div>
            <div><dt>Rod</dt><dd>{rodAddress?.slice(0, 8)}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}

function RodItem({ name, price, onBuy, onEquip }: any) {
  return (
    <div style={{ padding: "10px", border: "1px solid #eee", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
      <div><strong>{name}</strong><small>{price}</small></div>
      <div>
        <button onClick={onBuy} className="text-button">Mint</button>
        <button onClick={onEquip} className="text-button">Equip</button>
      </div>
    </div>
  );
}

function LeaderRow({ leader, rank }: { leader: LeaderboardEntry; rank: number }) {
  return <div className="leader-row"><span>{rank}</span><strong>{leader.address.slice(0, 6)}</strong><span>{leader.xp} XP</span></div>;
}

function readableError(error: unknown): string {
  if (error instanceof BaseError) return error.shortMessage;
  return error instanceof Error ? error.message : "Error";
}
