"use client";

import { useEffect, useRef, useState } from "react";
import {
  BaseError,
  createWalletClient,
  custom,
  decodeEventLog,
  createPublicClient,
  http,
  type Address,
  type Hash,
} from "viem";
import { appChain, contractAddress, contractStartBlock, rpcUrl } from "@/lib/config";
import { celoCatchAbi, fishCaughtEvent } from "@/lib/contract";
import { loadGameSnapshot, type GameSnapshot } from "@/lib/celo";
import {
  ensureExpectedChain,
  getMiniPayAddress,
  getMiniPayProvider,
  injectMiniPayStyle,
  type MiniPayProvider,
} from "@/lib/ethereum";

// Client diinisialisasi di atas agar tidak menyebabkan error TypeScript "used before declaration"
const publicClient = createPublicClient({
  chain: appChain,
  transport: http(rpcUrl),
});

type CatchResult = {
  fishType: number;
  name: string;
  emoji: string;
  xp: number;
};

const fishGuide = [
  { type: 1, name: "Celo Carp", emoji: "🐟", rarity: "Common", desc: "Ikan paling setia di ekosistem Celo." },
  { type: 2, name: "Valora Trout", emoji: "🐠", rarity: "Uncommon", desc: "Berenang cepat bagai transaksi MiniPay." },
  { type: 3, name: "Mento Mackerel", emoji: "🐡", rarity: "Rare", desc: "Ikan langka penyeimbang stabilitas laut." },
  { type: 4, name: "Gold Celo Whale", emoji: "🐋", rarity: "Epic", desc: "Legenda penguasa lautan terdalam Celo!" },
];

export default function CeloCatchApp() {
  const [account, setAccount] = useState<Address | null>(null);
  const [game, setGame] = useState<GameSnapshot>({ totalCasts: 0, canCast: false, leaders: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Initializing MiniPay environment...");
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);

  const providerRef = useRef<MiniPayProvider | null>(null);

  useEffect(() => {
    injectMiniPayStyle();

    const provider = getMiniPayProvider();
    if (!provider) {
      setStatus("MiniPay / Web3 provider tidak terdeteksi.");
      return;
    }
    providerRef.current = provider;

    getMiniPayAddress(provider)
      .then((address) => {
        if (address) {
          // ✅ PERBAIKAN DI SINI: Konversi tipe string menjadi `Address` milik Viem
          const validAddress = address as Address; 
          setAccount(validAddress);
          return refreshGame(validAddress);
        } else {
          setStatus("Gagal mendapatkan alamat wallet MiniPay.");
        }
      })
      .catch((error) => {
        console.error(error);
        setStatus("Koneksi wallet gagal terhubung.");
      });
  }, []);

  async function refreshGame(playerAddress?: Address) {
    try {
      const snapshot = await loadGameSnapshot(playerAddress);
      setGame(snapshot);
      if (playerAddress) {
        setStatus("Siap melempar pancingan!");
      }
    } catch (error) {
      console.error(error);
      setStatus("Gagal memuat status data permainan.");
    }
  }

  // Karena contract baru canCast selalu true (limitasi harian dihapus di contract baru)
  const canCast = game.canCast && !loading && !!account;
  const playerStats = account ? game.leaders.find((l) => l.address.toLowerCase() === account.toLowerCase()) : null;

  async function castLine() {
    const provider = providerRef.current;
    if (!provider || !account || !contractAddress) return;

    setLoading(true);
    setLastCatch(null);
    setTransactionHash(null);
    setStatus("Persiapkan pancingmu. Konfirmasi di MiniPay...");

    try {
      await ensureExpectedChain(provider, appChain, rpcUrl);

      const walletClient = createWalletClient({
        account,
        chain: appChain,
        transport: custom(provider),
      });

      // Panggil langsung fungsi recordCatch() di smart contract baru
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: celoCatchAbi,
        functionName: "recordCatch",
      });

      setTransactionHash(hash);
      setStatus("Sedang menarik pancingan di jaringan Celo...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let caughtFishType = 1;
      let caughtXp = 10;

      // Scan event logs dari receipt transaksi untuk mendeteksi hasil acak dari smart contract
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: celoCatchAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "FishCaught") {
            caughtFishType = Number(decoded.args.fishType);
            caughtXp = Number(decoded.args.xp);
          }
        } catch (e) {
          // Log diabaikan jika bukan milik celoCatchAbi
        }
      }

      const caughtFishInfo = fishGuide.find((f) => f.type === caughtFishType) || fishGuide[0];

      setLastCatch({
        fishType: caughtFishType,
        name: caughtFishInfo.name,
        emoji: caughtFishInfo.emoji,
        xp: caughtXp,
      });

      setStatus("Tangkapan berhasil dicatat on-chain!");
      await refreshGame(account);
    } catch (error) {
      console.error(error);
      setStatus(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100 px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎣</span>
            <h1 className="font-bold text-xl bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
              CeloCatch
            </h1>
          </div>
          {account ? (
            <div className="bg-sky-50 px-3 py-1 rounded-full border border-sky-100 text-xs font-mono text-sky-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <div className="bg-rose-50 px-3 py-1 rounded-full border border-rose-100 text-xs text-rose-600 font-medium">
              Connecting Wallet
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Game Stats & Action */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-sky-900/5 border border-sky-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-70"></div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Your Level / XP</p>
              <p className="text-2xl font-bold text-slate-700 flex items-baseline gap-1">
                {playerStats ? Math.floor(playerStats.xp / 100) + 1 : 1}
                <span className="text-xs text-slate-400 font-normal">({playerStats?.xp ?? 0} XP)</span>
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Casts</p>
              <p className="text-2xl font-bold text-slate-700">{playerStats?.casts ?? 0}</p>
            </div>
          </div>

          {/* Fishing Area Visualization */}
          <div className="bg-gradient-to-b from-sky-300 to-sky-500 rounded-2xl h-44 mb-6 relative overflow-hidden flex flex-col items-center justify-center border-b-4 border-sky-600 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>

            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl animate-bounce">🎣</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                </div>
              </div>
            ) : lastCatch ? (
              <div className="flex flex-col items-center text-center animate-fade-in">
                <span className="text-6xl mb-1 drop-shadow-md animate-wiggle">{lastCatch.emoji}</span>
                <h4 className="text-white font-bold text-lg drop-shadow-sm">{lastCatch.name}</h4>
                <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-sm mt-1">
                  +{lastCatch.xp} XP
                </span>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-4xl block opacity-80">🌊</span>
                <p className="text-sky-100 text-xs font-medium">Lautan tenang menanti pancinganmu</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={castLine}
            disabled={!canCast}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-base ${
              canCast
                ? "bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 shadow-sky-500/20 active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? "Menarik Tali Pancing..." : "Lempar Pancingan"}
          </button>

          {/* Status Message */}
          <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2.5">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{status}</p>
          </div>

          {transactionHash && (
            <div className="mt-2 text-center">
              <a
                href={`https://celoscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-600 font-mono hover:underline"
              >
                Tx: {transactionHash.slice(0, 20)}...
              </a>
            </div>
          )}
        </section>

        {/* Fish Lexicon / Guide */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-sky-900/5 border border-sky-50/50">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📚</span> Panduan Spesies Ikan
          </h3>
          <div className="space-y-3">
            {fishGuide.map((fish) => (
              <div key={fish.type} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-3xl bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                  {fish.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-700 truncate">{fish.name}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                        fish.rarity === "Epic"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : fish.rarity === "Rare"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : fish.rarity === "Uncommon"
                          ? "bg-sky-50 text-sky-600 border border-sky-100"
                          : "bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      {fish.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{fish.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-sky-900/5 border border-sky-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>🏆</span> Papan Peringkat Pemancing
            </h3>
            <span className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full font-bold">
              Total Tarikan: {game.totalCasts}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {game.leaders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                Belum ada rekor memancing tercatat.
              </div>
            ) : (
              game.leaders.map((leader, index) => {
                const isMe = account && leader.address.toLowerCase() === account.toLowerCase();
                return (
                  <div key={leader.address} className={`flex items-center justify-between py-3 ${isMe ? "bg-sky-50/40 -mx-2 px-2 rounded-xl" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-5 font-bold text-sm text-center ${index < 3 ? "text-amber-500" : "text-slate-400"}`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? "text-sky-700 font-bold" : "text-slate-700"}`}>
                          {leader.address.slice(0, 6)}...{leader.address.slice(-4)} {isMe ? "(Kamu)" : ""}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{leader.casts}x tarikan sukses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-700">{leader.xp}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">XP</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="text-center mt-8 px-4 text-[10px] text-slate-400 font-medium space-y-1">
        <p>Struktur Kontrak Inti CeloCatch v2 Baru Terintegrasi</p>
        <p className="font-mono text-[9px] opacity-70">Core: {contractAddress}</p>
      </footer>
    </div>
  );
}

function readableError(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.shortMessage.includes("User rejected")) {
      return "Transaksi dibatalkan oleh pengguna.";
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan transaksi tidak terduga.";
}
