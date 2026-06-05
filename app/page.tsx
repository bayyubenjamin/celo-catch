"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://alfajores-forno.celo-testnet.org";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 44787);
const START_BLOCK = Number(process.env.NEXT_PUBLIC_START_BLOCK || 0);

const ABI = [
  "function recordCatch(uint8 fishType,uint256 xp,uint256 nonce,uint256 deadline,bytes signature) external",
  "function canCast(address player) external view returns (bool)",
  "function totalCasts() external view returns (uint256)",
  "event FishCaught(address indexed player,uint8 fishType,uint256 xp,uint256 day,uint256 nonce,uint256 timestamp)"
];

type Leader = {
  address: string;
  xp: number;
  casts: number;
};

type CatchResult = {
  fishType: number;
  name: string;
  emoji: string;
  xp: number;
  nonce: string;
  deadline: number;
  signature: string;
};

function shortAddress(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

async function switchToCelo() {
  if (!window.ethereum) throw new Error("Wallet not found");

  const hexChainId = "0x" + CHAIN_ID.toString(16);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }]
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: CHAIN_ID === 42220 ? "Celo Mainnet" : "Celo Alfajores",
            nativeCurrency: {
              name: "CELO",
              symbol: "CELO",
              decimals: 18
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [
              CHAIN_ID === 42220
                ? "https://celoscan.io"
                : "https://alfajores.celoscan.io"
            ]
          }
        ]
      });
    } else {
      throw switchError;
    }
  }
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Connect wallet and start fishing.");
  const [loading, setLoading] = useState(false);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [canCast, setCanCast] = useState(true);
  const [totalCasts, setTotalCasts] = useState(0);

  const readContract = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  }, []);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("Wallet not found. Buka pakai MetaMask/MiniPay browser.");
        return;
      }

      await switchToCelo();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setStatus("Wallet connected. Ready to cast.");
      await loadData(accounts[0]);
    } catch (err: any) {
      setStatus(err?.message || "Failed to connect wallet.");
    }
  }

  async function loadData(userAddress?: string) {
    try {
      if (!readContract) return;

      const tc = await readContract.totalCasts();
      setTotalCasts(Number(tc));

      if (userAddress) {
        const allowed = await readContract.canCast(userAddress);
        setCanCast(Boolean(allowed));
      }

      const filter = readContract.filters.FishCaught();
      const events = await readContract.queryFilter(filter, START_BLOCK, "latest");

      const map = new Map<string, Leader>();

      for (const ev of events) {
        const parsed: any = ev;
        const player = parsed.args.player as string;
        const xp = Number(parsed.args.xp);

        const old = map.get(player.toLowerCase()) || {
          address: player,
          xp: 0,
          casts: 0
        };

        old.xp += xp;
        old.casts += 1;

        map.set(player.toLowerCase(), old);
      }

      const sorted = Array.from(map.values())
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 20);

      setLeaders(sorted);
    } catch (err) {
      console.log(err);
    }
  }

  async function castLine() {
    try {
      if (!account) {
        await connectWallet();
        return;
      }

      if (!CONTRACT_ADDRESS) {
        setStatus("Contract address missing. Isi NEXT_PUBLIC_CONTRACT_ADDRESS di .env.local.");
        return;
      }

      setLoading(true);
      setLastCatch(null);
      setStatus("Casting line...");

      await switchToCelo();

      const resultRes = await fetch("/api/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ account })
      });

      const result = await resultRes.json();

      if (!resultRes.ok) {
        throw new Error(result.error || "Failed to generate catch.");
      }

      setStatus("Fish found. Confirm transaction.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.recordCatch(
        result.fishType,
        result.xp,
        result.nonce,
        result.deadline,
        result.signature
      );

      setStatus("Waiting confirmation...");
      await tx.wait();

      setLastCatch(result);
      setStatus("Catch recorded onchain!");
      await loadData(account);
    } catch (err: any) {
      const message = err?.reason || err?.shortMessage || err?.message || "Cast failed.";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(account);
  }, [account]);

  return (
    <main className="min-h-screen px-4 py-6">
      <section className="mx-auto max-w-md">
        <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">
                Genesis Pond
              </p>
              <h1 className="mt-2 text-4xl font-black">Celo Catch</h1>
            </div>
            <div className="text-5xl">🎣</div>
          </div>

          <p className="text-sm leading-6 text-slate-200">
            Cast daily. Catch rare fish. Build your onchain fishing proof and climb the Genesis leaderboard.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-950/70 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Wallet</span>
              <span className="font-semibold">
                {account ? shortAddress(account) : "Not connected"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Casts</span>
              <span className="font-semibold">{totalCasts}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Daily Cast</span>
              <span className={canCast ? "text-emerald-300" : "text-red-300"}>
                {canCast ? "Available" : "Already used"}
              </span>
            </div>
          </div>

          <button
            onClick={account ? castLine : connectWallet}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-60"
          >
            {loading ? "Fishing..." : account ? "Cast Line" : "Connect Wallet"}
          </button>

          <p className="mt-4 text-center text-sm text-cyan-100">{status}</p>
        </div>

        {lastCatch && (
          <div className="mb-5 rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5 text-center">
            <div className="text-6xl">{lastCatch.emoji}</div>
            <h2 className="mt-3 text-2xl font-black">{lastCatch.name}</h2>
            <p className="mt-1 text-yellow-100">+{lastCatch.xp} XP</p>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Leaderboard</h2>
            <button
              onClick={() => loadData(account)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {leaders.length === 0 && (
              <p className="text-sm text-slate-300">
                No fishers yet. Be the first Genesis Fisher.
              </p>
            )}

            {leaders.map((leader, index) => (
              <div
                key={leader.address}
                className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300 font-black text-slate-950">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{shortAddress(leader.address)}</p>
                    <p className="text-xs text-slate-400">{leader.casts} casts</p>
                  </div>
                </div>
                <div className="font-black">{leader.xp} XP</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-black">Fish Rarity</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-200">
            <div>🐟 Tiny — 10 XP</div>
            <div>🐠 Blue — 25 XP</div>
            <div>🐡 Puffer — 75 XP</div>
            <div>✨🐟 Golden — 150 XP</div>
            <div>🦈 Shark — 350 XP</div>
            <div>🐋 Whale — 1000 XP</div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-cyan-300/10 bg-cyan-300/5 p-5 text-sm leading-6 text-slate-200">
          <p className="font-bold text-white">Genesis Season</p>
          <p className="mt-2">
            No token. No promise. Every catch is recorded onchain. Early fishers may be included in future community snapshots.
          </p>
        </div>
      </section>
    </main>
  );
}
