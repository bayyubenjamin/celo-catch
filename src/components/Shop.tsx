// src/components/Shop.tsx
import React from "react";

interface ShopProps {
  isConnected: boolean;
  buyRod: (id: number) => void;
  upgradeRod: (id: number) => void;
  mintNft: () => void;
  status: string;
}

export default function Shop({ isConnected, buyRod, upgradeRod, mintNft, status }: ShopProps) {
  const rods = [
    { id: 1, name: "Beginner Rod", price: "1 CELO", bonus: "+10% Catch Rate" },
    { id: 2, name: "Pro Rod", price: "5 CELO", bonus: "+25% Catch Rate" },
    { id: 3, name: "Master Rod", price: "20 CELO", bonus: "+50% Catch Rate" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span>🏪</span> Rod Shop
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rods.map((rod) => (
            <div key={rod.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col">
              <h3 className="text-lg font-bold text-blue-400 mb-1">{rod.name}</h3>
              <p className="text-emerald-400 font-mono mb-3">{rod.price}</p>
              <p className="text-sm text-slate-400 mb-6 flex-grow">{rod.bonus}</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => buyRod(rod.id)}
                  disabled={!isConnected}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy
                </button>
                <button
                  onClick={() => upgradeRod(rod.id)}
                  disabled={!isConnected}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upgrade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-2xl p-6 border border-purple-700/50 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          <span>🖼️</span> Exclusive NFT
        </h2>
        <p className="text-slate-300 mb-6">
          Mint your exclusive Celo Catch NFT to unlock special in-game perks and show off your status on the blockchain.
        </p>
        <button
          onClick={mintNft}
          disabled={!isConnected}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-900/50 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Mint NFT
        </button>
      </div>

      {status && status !== "Idle" && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center font-mono text-sm text-slate-400">
          System: {status}
        </div>
      )}
    </div>
  );
}
