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
  
  // Tab State
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
      setStatus("Celo data is temporarily unavailable. Pull down and try again.");
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
      setStatus(
        configured
          ? "Your daily cast is ready."
          : "Wallet ready. The contract still needs to be deployed.",
      );
      await refreshGame(address);
    } catch (error) {
      console.error(error);
      setAccount(null);
      setWalletPhase("error");
      setStatus(readableError(error));
    }
  }, [configured, refreshGame]);

  useEffect(() => {
    void connectInjectedWallet();
  }, [connectInjectedWallet]);

  useEffect(() => {
    const provider = providerRef.current;
    if (!provider?.on) return;
    const onAccountsChanged = () => void connectInjectedWallet();
    const onChainChanged = () => void connectInjectedWallet();
    provider.on("accountsChanged", onAccountsChanged);
    provider.on("chainChanged", onChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [connectInjectedWallet]);

  // --- MINT & EQUIP LOGIC ---
  async function buyRod(id: number, priceCelo: string) {
    if (!providerRef.current || !account || !rodAddress) return;
    setLoading(true);
    setTransactionHash(null);
    setStatus(`Minting ${id === 1 ? 'Basic' : id === 2 ? 'Pro' : 'Legend'} Rod...`);
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
      setStatus("Waiting for on-chain confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rod successfully minted! Don't forget to Equip it.");
    } catch (error) {
      setStatus(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  async function equipRod(id: number) {
    if (!providerRef.current || !account || !contractAddress) return;
    setLoading(true);
    setTransactionHash(null);
    setStatus(`Equipping Rod ID ${id}...`);
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
      setStatus("Equipping...");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rod equipped! Your next catch will have a bonus.");
    } catch (error) {
      setStatus(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  // --- CASTING LOGIC (V2 On-chain Randomness) ---
  async function castLine() {
    const provider = providerRef.current;
    if (!provider || !account || !contractAddress || !canCast) return;

    setLoading(true);
    setLastCatch(null);
    setTransactionHash(null);
    setStatus("Casting your line into the pond...");

    try {
      await ensureExpectedChain(provider, appChain, rpcUrl);

      const walletClient = createWalletClient({
        account,
        chain: appChain,
        transport: custom(provider),
      });

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: celoCatchAbi,
        functionName: "recordCatch",
      });

      setTransactionHash(hash);
      setStatus("Recording your catch on Celo…");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let caughtFishType = 1;
      let caughtXp = 10;

      for (const log of receipt.logs) {
        try {
            const decoded = decodeEventLog({
              abi: celoCatchAbi,
              data: log.data,
              topics: log.topics,
            });
            
            if (decoded.eventName === "FishCaught") {
              const args = decoded.args as any;
              caughtFishType = Number(args.fishType);
              caughtXp = Number(args.xp);
            }
          } catch (e) { /* Abaikan log yang bukan dari kontrak ini */ }

      const caughtFishInfo = fishGuide.find((f) => f.type === caughtFishType) || fishGuide[0];

      setLastCatch({
        fishType: caughtFishType,
        name: caughtFishInfo.name,
        emoji: caughtFishInfo.emoji,
        xp: caughtXp,
      });

      setStatus("Catch recorded! Check your XP.");
      await refreshGame(account);
    } catch (error) {
      console.error(error);
      setStatus(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  const castDisabled = loading || walletPhase !== "ready" || !account || !configured || !canCast;

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div>
            <p className="eyebrow">A tiny daily game on Celo</p>
            <h1>Celo Catch</h1>
          </div>
          <span className={`network-pill ${miniPay ? "is-minipay" : ""}`}>
            {miniPay ? "MiniPay" : appChain.name}
          </span>
        </header>

        {/* --- TAB NAVIGATION --- */}
        <div style={{ display: "flex", gap: "8px", background: "var(--surface-color, #fff)", padding: "4px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <button 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'pond' ? "#f6c453" : "transparent", color: activeTab === 'pond' ? "#000" : "#666" }} 
            onClick={() => setActiveTab("pond")}
          >
            🎣 The Pond
          </button>
          <button 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'shop' ? "#f6c453" : "transparent", color: activeTab === 'shop' ? "#000" : "#666" }} 
            onClick={() => setActiveTab("shop")}
          >
            ⛺ Rod Shop
          </button>
        </div>

        {!configured && (
          <aside className="setup-note" role="note">
            <strong>Preview mode</strong>
            <span>Deploy the contract and add its address to enable live casts.</span>
          </aside>
        )}

        {/* --- POND TAB CONTENT --- */}
        {activeTab === "pond" && (
          <>
            <section className="pond-card" aria-labelledby="today-heading">
              <div className="pond-copy">
                <p className="section-kicker">Genesis pond</p>
                <h2 id="today-heading">One cast. One catch. Every day.</h2>
                <p>Equip your rod from the Shop, find a fish, and earn XP.</p>
              </div>
              <div className="pond-scene" aria-hidden="true">
                <span className="sun-dot" />
                <span className="fishing-line" />
                <span className="hook">⌁</span>
                <span className="fish fish-one">🐟</span>
                <span className="fish fish-two">🐠</span>
                <span className="water-line water-one" />
                <span className="water-line water-two" />
              </div>
            </section>

            <section className="action-card" aria-labelledby="cast-heading">
              <div className="card-heading-row">
                <div>
                  <p className="section-kicker">Today</p>
                  <h2 id="cast-heading">Your daily cast</h2>
                </div>
                <span className={`availability ${canCast ? "available" : ""}`}>
                  {configured ? (canCast ? "Available" : "Used") : "Setup pending"}
                </span>
              </div>

              <dl className="wallet-summary">
                <div>
                  <dt>Wallet</dt>
                  <dd>{walletPhase === "checking" ? "Connecting…" : shortAccount}</dd>
                </div>
                <div>
                  <dt>Network</dt>
                  <dd>{isMainnet ? "Celo Mainnet" : "Celo Sepolia"}</dd>
                </div>
                <div>
                  <dt>All-time casts</dt>
                  <dd>{refreshing ? "…" : totalCasts.toLocaleString()}</dd>
                </div>
              </dl>

              <button type="button" className="cast-button" onClick={castLine} disabled={castDisabled}>
                <span aria-hidden="true">🎣</span>
                <span>{loading ? "Casting…" : canCast ? "Cast today’s line" : "Come back tomorrow"}</span>
              </button>

              <p className="status-copy" role="status" aria-live="polite">{status}</p>

              {transactionHash && explorerUrl && (
                <a className="transaction-link" href={`${explorerUrl}/tx/${transactionHash}`} target="_blank" rel="noreferrer">
                  View transaction
                </a>
              )}
            </section>

            {lastCatch && (
              <section className="catch-card" aria-label="Latest catch">
                <div className="catch-emoji" aria-hidden="true">{lastCatch.emoji}</div>
                <div>
                  <p className="section-kicker">Caught today</p>
                  <h2>{lastCatch.name}</h2>
                  <p className="catch-xp">+{lastCatch.xp} XP</p>
                </div>
              </section>
            )}

            <section className="leaderboard-card" aria-labelledby="leaderboard-heading">
              <div className="card-heading-row">
                <div>
                  <p className="section-kicker">Genesis season</p>
                  <h2 id="leaderboard-heading">Top fishers</h2>
                </div>
                <button type="button" className="text-button" onClick={() => void refreshGame(account)} disabled={refreshing || !configured}>
                  {refreshing ? "Refreshing" : "Refresh"}
                </button>
              </div>

              <div className="leader-list">
                {leaders.length === 0 ? (
                  <div className="empty-state">
                    <span aria-hidden="true">🌊</span>
                    <p>{configured ? "No catches yet. The pond is still quiet." : "Leaderboard appears after contract deployment."}</p>
                  </div>
                ) : (
                  leaders.map((leader, index) => (
                    <LeaderRow key={leader.address} leader={leader} rank={index + 1} />
                  ))
                )}
              </div>
            </section>

            <section className="guide-card" aria-labelledby="guide-heading">
              <p className="section-kicker">Pond guide</p>
              <h2 id="guide-heading">What might bite?</h2>
              <div className="fish-grid">
                {fishGuide.map((fish) => (
                  <div className="fish-tile" key={fish.name}>
                    <span aria-hidden="true">{fish.emoji}</span>
                    <div>
                      <strong>{fish.name}</strong>
                      <small>{fish.xp} XP</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* --- SHOP TAB CONTENT --- */}
        {activeTab === "shop" && (
          <section className="action-card" aria-labelledby="shop-heading">
            <div className="card-heading-row">
              <div>
                <p className="section-kicker">Blacksmith</p>
                <h2 id="shop-heading">Rod Shop</h2>
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Mint and equip a better rod to get passive XP bonuses on every catch!
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <RodItem id={1} name="Basic Rod" price="Free" bonus="+0 XP" disabled={loading} onBuy={() => buyRod(1, "0")} onEquip={() => equipRod(1)} />
              <RodItem id={2} name="Pro Rod" price="5 CELO" bonus="+50 XP" disabled={loading} onBuy={() => buyRod(2, "5")} onEquip={() => equipRod(2)} />
              <RodItem id={3} name="Legend Rod" price="10 CELO" bonus="+200 XP" disabled={loading} onBuy={() => buyRod(3, "10")} onEquip={() => equipRod(3)} />
            </div>

            <p className="status-copy" role="status" aria-live="polite">{status}</p>
            {transactionHash && explorerUrl && (
              <a className="transaction-link" href={`${explorerUrl}/tx/${transactionHash}`} target="_blank" rel="noreferrer">
                View transaction
              </a>
            )}
          </section>
        )}

        {/* --- EKOSISTEM KONTRAK --- */}
        <section className="action-card" aria-labelledby="ecosystem-heading" style={{ marginTop: activeTab === 'shop' ? '24px' : '0' }}>
          <div className="card-heading-row">
            <div>
              <p className="section-kicker">Contracts</p>
              <h2 id="ecosystem-heading">Mainnet Ecosystem</h2>
            </div>
          </div>
          <dl className="wallet-summary">
            <div>
              <dt>Core Game</dt>
              <dd>{contractAddress ? `${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)}` : "Not Set"}</dd>
            </div>
            <div>
              <dt>Fishing Rod</dt>
              <dd>{rodAddress ? `${rodAddress.slice(0, 6)}…${rodAddress.slice(-4)}` : "Not Set"}</dd>
            </div>
            <div>
              <dt>NFT Assets</dt>
              <dd>{nftAddress ? `${nftAddress.slice(0, 6)}…${nftAddress.slice(-4)}` : "Not Set"}</dd>
            </div>
            <div>
              <dt>$CATCH Token</dt>
              <dd>{tokenAddress ? `${tokenAddress.slice(0, 6)}…${tokenAddress.slice(-4)}` : "Not Set"}</dd>
            </div>
          </dl>
        </section>

        <footer>
          <span>Built on Celo</span>
          <span aria-hidden="true">•</span>
          <span>Designed for MiniPay</span>
        </footer>
      </div>
    </main>
  );
}

// --- KOMPONEN TAMBAHAN UNTUK ITEM PANCINGAN ---
function RodItem({ id, name, price, bonus, onBuy, onEquip, disabled }: any) {
  return (
    <div style={{ padding: "12px", border: "1px solid var(--border-color, #eee)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <strong style={{ display: "block" }}>{name}</strong>
        <small style={{ color: "var(--text-secondary)" }}>{price} • {bonus}</small>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={onBuy} disabled={disabled} className="text-button" style={{ background: "#f1f5f9", padding: "6px 12px" }}>Mint</button>
        <button type="button" onClick={onEquip} disabled={disabled} className="text-button" style={{ background: "#e0f2fe", color: "#0284c7", padding: "6px 12px" }}>Equip</button>
      </div>
    </div>
  );
}

function LeaderRow({ leader, rank }: { leader: LeaderboardEntry; rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
  return (
    <div className="leader-row">
      <span className="rank" aria-label={`Rank ${rank}`}>{medal}</span>
      <div className="leader-address">
        <strong>{leader.address.slice(0, 6)}…{leader.address.slice(-4)}</strong>
        <small>{leader.casts} {leader.casts === 1 ? "cast" : "casts"}</small>
      </div>
      <strong className="leader-xp">{leader.xp.toLocaleString()} XP</strong>
    </div>
  );
}

function readableError(error: unknown): string {
  if (error instanceof BaseError) return error.shortMessage;
  if (error instanceof Error) {
    if (/user rejected|denied|cancelled/i.test(error.message)) {
      return "Transaction cancelled.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
