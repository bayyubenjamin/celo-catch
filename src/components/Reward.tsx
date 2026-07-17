// src/components/Reward.tsx
import React from "react";

interface RewardProps {
  isConnected: boolean;
  claimToken: () => void;
  status: string;
}

export default function Reward({ isConnected, claimToken, status }: RewardProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-amber-900/80 to-slate-900 rounded-2xl p-8 border border-amber-700/50 shadow-xl text-center">
        <div className="mb-6">
          <span className="text-7xl">🎁</span>
        </div>
        <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
          Claim Your Rewards
        </h2>
        <p className="text-slate-300 mb-8 max-w-md mx-auto">
          Convert your hard-earned XP into tokens. The more you catch, the more you earn!
        </p>
        
        <button
          onClick={claimToken}
          disabled={!isConnected}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xl font-bold py-4 px-12 rounded-xl shadow-lg shadow-orange-900/50 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Claim Tokens
        </button>

        {status && status !== "Idle" && (
          <p className="mt-6 text-amber-200/80 font-mono text-sm bg-black/20 py-2 px-4 rounded-lg inline-block">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
