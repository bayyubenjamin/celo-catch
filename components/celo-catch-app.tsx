"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaseError, createWalletClient, custom, type Address, type Hash } from "viem";
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

export default function CeloCatchApp() {
  const providerRef = useRef<Eip1193Provider | null>(null);
  const [walletPhase, setWalletPhase] = useState<WalletPhase>("checking");
  const [account, setAccount] = useState<Address | null>(null);
  const [miniPay, setMiniPay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [totalCasts, setTotalCasts] = useState(0);

  // Contract specific state
  const configured = contractAddress !== null;

  const refreshGame = useCallback(async (player?: Address | null) => {
    if (!configured) return;
    try {
      const snapshot = await loadGameSnapshot(player ?? undefined);
      setTotalCasts(snapshot.totalCasts);
      setLeaders(snapshot.leaders);
    } catch (error) {
      console.error("Refresh failed", error);
    }
  }, [configured]);

  const connectWallet = useCallback(async () => {
    const provider = getInjectedProvider();
    providerRef.current = provider;
    if (!provider) {
      setWalletPhase("missing");
      return;
    }
    setMiniPay(isMiniPayProvider(provider));
    try {
      const address = await requestPrimaryAccount(provider);
      await ensureExpectedChain(provider, appChain, rpcUrl);
      setAccount(address);
      setWalletPhase("ready");
      await refreshGame(address);
    } catch (e) {
      setWalletPhase("error");
    }
  }, [refreshGame]);

  useEffect(() => { void connectWallet(); }, [connectWallet]);

  return (
    <main className="app-shell min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Celo Catch</h1>
            <p className="text-sm text-neutral-500">Professional Fishing Dashboard</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${miniPay ? "bg-green-100 text-green-700" : "bg-neutral-200"}`}>
            {miniPay ? "MiniPay Active" : appChain.name}
          </span>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Casts" value={totalCasts.toString()} />
          <StatCard label="Season" value="Genesis" />
          <StatCard label="Status" value={walletPhase === "ready" ? "Active" : "Locked"} />
          <StatCard label="Network" value={isMainnet ? "Mainnet" : "Sepolia"} />
        </section>

        {/* Main Action Area */}
        <section className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Daily Operations</h2>
          <button 
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            disabled={walletPhase !== "ready"}
            onClick={() => { /* Implement your cast function here */ }}
          >
            {loading ? "Casting..." : "Initiate Daily Cast"}
          </button>
        </section>

        {/* Professional Leaderboard */}
        <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-lg font-semibold">Global Leaderboard</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3 text-right">XP Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leaders.length > 0 ? leaders.map((l, i) => (
                <tr key={l.address} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">#{i + 1}</td>
                  <td className="px-6 py-4 font-mono text-sm">{l.address.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-right font-semibold">{l.xp.toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Detailed Contract Inspector */}
        <section className="bg-neutral-900 text-neutral-300 p-6 rounded-2xl">
          <h2 className="text-white font-semibold mb-4">Contract State Explorer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="flex justify-between border-b border-neutral-800 py-2">
              <span>Core Address</span>
              <span className="text-white">{contractAddress?.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 py-2">
              <span>Rod Logic</span>
              <span className="text-white">Active</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 py-2">
              <span>CeloCatchNFT</span>
              <span className="text-white">Minting Enabled</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 py-2">
              <span>Fishing Yield</span>
              <span className="text-white">7.5% APY</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
      <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
