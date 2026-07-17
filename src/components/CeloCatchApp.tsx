// src/components/CeloCatchApp.tsx
"use client";

import React from "react";
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
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      <header className="w-full p-4 flex items-center justify-between bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎣</span>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Celo Catch
          </h1>
        </div>
        <ConnectButton />
      </header>

      <div className="w-full bg-blue-600 text-white text-center py-2 text-sm font-medium tracking-wide shadow-inner">
        Welcome to Celo Catch! Cast your line and earn rewards.
      </div>

      <div className="w-full bg-slate-800 py-3 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-semibold text-slate-300">Mainnet Ecosystem</span>
        </div>
      </div>

      <Navbar activeTab={celoCatch.activeTab} setActiveTab={celoCatch.setActiveTab} />

      <main className="max-w-4xl mx-auto p-4 pb-24">
        {celoCatch.activeTab === "Pond" && <Pond {...celoCatch} />}
        {celoCatch.activeTab === "Shop" && <Shop {...celoCatch} />}
        {celoCatch.activeTab === "Reward" && <Reward {...celoCatch} />}
        {celoCatch.activeTab === "Profile" && <Profile />}
      </main>
    </div>
  );
}
