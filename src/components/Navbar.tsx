// src/components/Navbar.tsx
import React from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: "Pond", icon: "🎣", label: "Pond" },
    { id: "Shop", icon: "🛒", label: "Shop" },
    { id: "Reward", icon: "🎁", label: "Reward" },
    { id: "Profile", icon: "👤", label: "Profile" },
  ];

  return (
    <nav className="w-full bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400 bg-slate-700/50"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
