"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseError,
  createWalletClient,
  custom,
  decodeEventLog,
  parseEther,
  parseAbi,
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

// --- ABI Tambahan untuk interaksi NFT dan Token ---
const nftAbi = parseAbi(["function mintFish(uint256 id) external"]);
const tokenAbi = parseAbi(["function claimReward(uint256 fishId) external"]);

type WalletPhase = "checking" | "ready" | "missing" | "error";
type TabState = "pond" | "shop" | "nft" | "token";

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
  
  const [playerXp, setPlayerXp] = useState<number>(0);

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
      setStatus("Sebagian data Celo lama mungkin tidak sinkron dengan kontrak baru.");
      setCanCast(true); 
    } 

    if (player && contractAddress) {
      try {
        const xp = await publicClient.readContract({
          address: contractAddress,
          abi: celoCatchAbi,
          functionName: "playerXP",
          args: [player]
        });
        setPlayerXp(Number(xp));
      } catch (e) {
        console.error("Gagal memuat XP dari kontrak", e);
      }
    }
    setRefreshing(false);
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
      setStatus(configured ? "Your cast is ready." : "Wallet ready. Contract not deployed.");
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

  async function upgradeRod(fromId: number, toId: number) {
    if (!providerRef.current || !account || !rodAddress) return;
    setLoading(true);
    setStatus(`Upgrading Rod...`);
    try {
      await ensureExpectedChain(providerRef.current, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const hash = await walletClient.writeContract({
        address: rodAddress,
        abi: fishingRodAbi,
        functionName: "burnAndUpgrade",
        args: [BigInt(fromId), BigInt(toId)]
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rod upgraded successfully!");
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

  async function mintNft(id: number) {
    if (!providerRef.current || !account || !nftAddress) return;
    setLoading(true);
    setStatus(`Minting NFT...`);
    try {
      await ensureExpectedChain(providerRef.current, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const hash = await walletClient.writeContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: "mintFish",
        args: [BigInt(id)]
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("NFT Minted Successfully!");
    } catch (error) { setStatus(readableError(error)); } finally { setLoading(false); }
  }

  async function claimToken(fishId: number) {
    if (!providerRef.current || !account || !tokenAddress) return;
    setLoading(true);
    setStatus(`Claiming CATCH Tokens...`);
    try {
      await ensureExpectedChain(providerRef.current, appChain, rpcUrl);
      const walletClient = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "claimReward",
        args: [BigInt(fishId)]
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Tokens Claimed Successfully!");
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

        {/* --- BANNER DIKEMBALIKAN KE ATAS SINI AGAR SELALU TAMPIL UTUH --- */}
        <section className="pond-card" style={{ marginBottom: "20px" }}>
          <h2>One cast. One catch. Every day.</h2>
          <div className="pond-scene"><span className="hook">⌁</span></div>
        </section>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", background: "#fff", padding: "4px", borderRadius: "12px", marginBottom: "24px", overflowX: "auto" }}>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'pond' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("pond")}>🎣 Pond</button>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'shop' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("shop")}>⛺ Shop</button>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'nft' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("nft")}>🖼️ NFT</button>
          <button style={{ flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "bold", background: activeTab === 'token' ? "#f6c453" : "transparent" }} onClick={() => setActiveTab("token")}>🎁 Reward</button>
        </div>

        {/* --- POND TAB --- */}
        {activeTab === "pond" && (
          <>
            <section className="action-card">
              <dl className="wallet-summary">
                <div><dt>Wallet</dt><dd>{shortAccount}</dd></div>
                <div><dt>Network</dt><dd>{isMainnet ? "Mainnet" : "Sepolia"}</dd></div>
                <div><dt>Your XP</dt><dd>{playerXp} XP</dd></div>
              </dl>
              <button className="cast-button" onClick={castLine} disabled={castDisabled}>{loading ? "Casting…" : "Cast line"}</button>
              <p className="status-copy">{status}</p>
            </section>
            
            {lastCatch && (
              <section className="catch-card" style={{ marginTop: '20px' }}>
                <h2>{lastCatch.emoji} {lastCatch.name}</h2>
                <p>+{lastCatch.xp} XP</p>
              </section>
            )}

            {leaders.length > 0 && (
              <section className="action-card" style={{ marginTop: '20px' }}>
                <h2>Leaderboard</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                  {leaders.map((l, rank) => (
                    <LeaderRow key={l.address} leader={l} rank={rank + 1} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* --- SHOP TAB --- */}
        {activeTab === "shop" && (
          <section className="action-card">
            <h2>Rod Shop & Upgrades</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <ItemCard name="Basic Rod (ID: 1)" description="Free" primaryAction={() => buyRod(1, "0")} primaryLabel="Mint" secondaryAction={() => equipRod(1)} secondaryLabel="Equip" />
              <ItemCard name="Pro Rod (ID: 2)" description="5 CELO (+50 XP Bonus)" primaryAction={() => buyRod(2, "5")} primaryLabel="Mint" secondaryAction={() => equipRod(2)} secondaryLabel="Equip" />
              <ItemCard name="Legend Rod (ID: 3)" description="10 CELO (+200 XP Bonus)" primaryAction={() => buyRod(3, "10")} primaryLabel="Mint" secondaryAction={() => equipRod(3)} secondaryLabel="Equip" />
              <ItemCard name="Upgrade to Pro" description="Burn 3 Basic Rods" primaryAction={() => upgradeRod(1, 2)} primaryLabel="Upgrade" />
              <ItemCard name="Upgrade to Legend" description="Burn 3 Pro Rods" primaryAction={() => upgradeRod(2, 3)} primaryLabel="Upgrade" />
            </div>
            <p className="status-copy">{status}</p>
          </section>
        )}

        {/* --- NFT TAB --- */}
        {activeTab === "nft" && (
          <section className="action-card">
            <h2>Mint Exclusive NFT</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>Kumpulkan XP dari memancing untuk mencetak NFT Ikan unik!</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <ItemCard name="Tiny Fish NFT (ID: 1)" description="Syarat: 150 XP" primaryAction={() => mintNft(1)} primaryLabel="Mint NFT" />
              <ItemCard name="Puffer Fish NFT (ID: 3)" description="Syarat: 2000 XP" primaryAction={() => mintNft(3)} primaryLabel="Mint NFT" />
            </div>
            <p className="status-copy">{status}</p>
          </section>
        )}

        {/* --- TOKEN TAB --- */}
        {activeTab === "token" && (
          <section className="action-card">
            <h2>Claim $CATCH Token</h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>Gunakan NFT Ikan yang kamu miliki untuk mengklaim 1000 $CATCH!</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <ItemCard name="Reward Tiny Fish (ID: 1)" description="Butuh: Tiny Fish NFT" primaryAction={() => claimToken(1)} primaryLabel="Claim" />
              <ItemCard name="Reward Puffer Fish (ID: 3)" description="Butuh: Puffer Fish NFT" primaryAction={() => claimToken(3)} primaryLabel="Claim" />
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

function ItemCard({ name, description, primaryAction, primaryLabel, secondaryAction, secondaryLabel }: any) {
  return (
    <div style={{ padding: "10px", border: "1px solid #eee", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div><strong>{name}</strong><br/><small style={{ color: "#666" }}>{description}</small></div>
      <div style={{ display: "flex", gap: "6px" }}>
        {primaryAction && <button onClick={primaryAction} className="text-button">{primaryLabel}</button>}
        {secondaryAction && <button onClick={secondaryAction} className="text-button">{secondaryLabel}</button>}
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
