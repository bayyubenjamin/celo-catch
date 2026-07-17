// src/components/Pond.tsx
import React from "react";

interface PondProps {
  address?: string;
  isConnected: boolean;
  displayBalance: string;
  xp: number;
  lastCatch: number | null;
  status: string;
  leaderboard: { address: string; xp: number }[];
  castLine: () => void;
}

export default function Pond({
  address,
  isConnected,
  displayBalance,
  xp,
  lastCatch,
  status,
  leaderboard,
  castLine
}: PondProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>💳</span> Wallet Info
        </h2>
        {isConnected ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Address</p>
              <p className="font-mono text-sm truncate">{address}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Balance</p>
              <p className="font-mono text-sm">{displayBalance} CELO</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Please connect your wallet to view info.</p>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl text-center">
        <div className="mb-6">
          <span className="text-6xl">🌊</span>
        </div>
        
        <div className="flex justify-center gap-8 mb-8">
          <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1 font-semibold uppercase tracking-wider">Your XP</p>
            <p className="text-3xl font-black text-blue-400">{xp}</p>
          </div>
          <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-1 font-semibold uppercase tracking-wider">Last Catch</p>
            <p className="text-3xl font-black text-emerald-400">{lastCatch ? lastCatch : "-"}</p>
          </div>
        </div>

        <button
          onClick={castLine}
          disabled={!isConnected}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xl font-bold py-4 px-12 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          🎣 Cast Line
        </button>
        
        <p className="mt-4 text-slate-400 font-mono text-sm">{status}</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>🏆</span> Leaderboard
        </h2>
        {leaderboard.length > 0 ? (
          <ul className="space-y-2">
            {leaderboard.map((player, index) => (
              <li key={index} className="flex justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="font-mono text-sm text-slate-300">{player.address}</span>
                <span className="font-bold text-blue-400">{player.xp} XP</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-center py-4">No data available yet.</p>
        )}
      </div>
    </div>
  );
}
