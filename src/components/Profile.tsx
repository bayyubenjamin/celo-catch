// src/components/Profile.tsx
import React from "react";

export default function Profile() {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full min-h-[50vh] text-center bg-slate-800 rounded-2xl border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mb-6 border-4 border-slate-600">
        <span className="text-4xl">👤</span>
      </div>
      <h2 className="text-3xl font-bold mb-4 text-white">Player Profile</h2>
      <p className="text-slate-400 max-w-sm">
        Fitur Profile akan segera hadir. Nantikan update selanjutnya untuk melihat statistik lengkap permainanmu!
      </p>
    </div>
  );
}
