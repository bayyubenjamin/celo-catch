"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseError,
  createWalletClient,
  custom,
  type Address,
  type Hash,
} from "viem";
import { appChain, contractAddress, isMainnet, rpcUrl } from "@/lib/config";
import { loadGameSnapshot, publicClient, type LeaderboardEntry } from "@/lib/celo";
import { celoCatchAbi } from "@/lib/contract";
import {
  ensureExpectedChain,
  getInjectedProvider,
  isMiniPayProvider,
  requestPrimaryAccount,
  type Eip1193Provider,
} from "@/lib/ethereum";

type WalletPhase = "checking" | "ready" | "missing" | "error";

type CatchResult = {
  fishType: number;
  name: string;
  emoji: string;
  xp: number;
  nonce: string;
  day: number;
  deadline: number;
  signature: `0x${string}`;
};

const fishGuide = [
  { emoji: "🐟", name: "Tiny", xp: 10 },
  { emoji: "🐠", name: "Blue", xp: 25 },
  { emoji: "🐡", name: "Puffer", xp: 75 },
  { emoji: "✨", name: "Golden", xp: 150 },
  { emoji: "🦈", name: "Shark", xp: 350 },
  { emoji: "🐋", name: "Whale", xp: 1000 },
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

  const configured = contractAddress !== null;
  const explorerUrl = appChain.blockExplorers?.default.url;

  const shortAccount = useMemo(
    () => (account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "—"),
    [account],
  );

  // ==========================================
  // FUNGSI CONNECT WALLET MANUAL (BARU)
  // ==========================================
  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        // Meminta user untuk memilih/menyetujui koneksi wallet
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as Address[];

        if (accounts && accounts.length > 0) {
          const selectedAccount = accounts[0];
          setAccount(selectedAccount);
          setWalletPhase("ready");
          setStatus(
            configured
              ? "Your daily cast is ready."
              : "Wallet ready. The contract still needs to be deployed."
          );
          await refreshGame(selectedAccount);
        }
      } catch (error) {
        console.error("User menolak koneksi atau terjadi error:", error);
      }
    } else {
      // Fallback jika dibuka di iOS Safari atau browser tanpa wallet
      alert(
        "Wallet tidak terdeteksi! \n\nPengguna iOS: Silakan buka link web ini langsung dari dalam browser aplikasi Valora, MetaMask, atau Trust Wallet Anda."
      );
    }
  };
  // ==========================================

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

  async function castLine() {
    const provider = providerRef.current;
    if (!provider || !account || !contractAddress || !canCast) return;

    setLoading(true);
    setLastCatch(null);
    setTransactionHash(null);
    setStatus("Finding today’s catch…");

    try {
      await ensureExpectedChain(provider, appChain, rpcUrl);

      const response = await fetch("/api/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account }),
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isCatchResult(payload)) {
        const message = isErrorPayload(payload)
          ? payload.error
          : "The catch service returned an invalid response.";
        throw new Error(message);
      }

      setStatus("Catch found. Confirm the transaction in MiniPay.");

      const walletClient = createWalletClient({
        account,
        chain: appChain,
        transport: custom(provider),
      });

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: celoCatchAbi,
        functionName: "recordCatch",
        args: [
          payload.fishType,
          BigInt(payload.xp),
          BigInt(payload.nonce),
          BigInt(payload.day),
          BigInt(payload.deadline),
          payload.signature,
        ],
      });

      setTransactionHash(hash);
      setStatus("Recording your catch on Celo…");
      await publicClient.waitForTransactionReceipt({ hash });

      setLastCatch(payload);
      setStatus("Catch recorded. Come back tomorrow for another cast.");
      await refreshGame(account);
    } catch (error) {
      console.error(error);
      setStatus(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  const castDisabled =
    loading || walletPhase !== "ready" || !account || !configured || !canCast;

  return (
    <main className="app-shell">
      <div className="page-wrap">
        
        {/* TOMBOL CONNECT MANUAL (BARU) */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={connectWallet}
            className="bg-[#1f7a72] hover:bg-[#165d56] text-white font-bold py-2 px-5 rounded-full shadow-md transition-all duration-300 text-sm border-2 border-[#142321]"
          >
            {account
              ? `${account.slice(0, 6)}…${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>

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

        <section className="pond-card" aria-labelledby="today-heading">
          <div className="pond-copy">
            <p className="section-kicker">Genesis pond</p>
            <h2 id="today-heading">One cast. One catch. Every day.</h2>
            <p>
              Find a fish, earn XP, and leave a small onchain trail without the usual Web3 clutter.
            </p>
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

        {!configured && (
          <aside className="setup-note" role="note">
            <strong>Preview mode</strong>
            <span>Deploy the contract and add its address to enable live casts.</span>
          </aside>
        )}

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

          <button
            type="button"
            className="cast-button"
            onClick={castLine}
            disabled={castDisabled}
          >
            <span aria-hidden="true">🎣</span>
            <span>{loading ? "Casting…" : canCast ? "Cast today’s line" : "Come back tomorrow"}</span>
          </button>

          <p className="status-copy" role="status" aria-live="polite">{status}</p>

          {transactionHash && explorerUrl && (
            <a
              className="transaction-link"
              href={`${explorerUrl}/tx/${transactionHash}`}
            >
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
            <button
              type="button"
              className="text-button"
              onClick={() => void refreshGame(account)}
              disabled={refreshing || !configured}
            >
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

        <footer>
          <span>Built on Celo</span>
          <span aria-hidden="true">•</span>
          <span>Designed for MiniPay</span>
        </footer>
      </div>
    </main>
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

function isCatchResult(value: unknown): value is CatchResult {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.fishType === "number" &&
    typeof item.name === "string" &&
    typeof item.emoji === "string" &&
    typeof item.xp === "number" &&
    typeof item.nonce === "string" &&
    typeof item.day === "number" &&
    typeof item.deadline === "number" &&
    typeof item.signature === "string" &&
    item.signature.startsWith("0x")
  );
}

function isErrorPayload(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function readableError(error: unknown): string {
  if (error instanceof BaseError) return error.shortMessage;
  if (error instanceof Error) {
    if (/user rejected|denied|cancelled/i.test(error.message)) {
      return "Transaction cancelled. Your daily cast is still available.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
