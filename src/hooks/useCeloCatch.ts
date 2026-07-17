import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaseError, createWalletClient, custom, decodeEventLog, parseEther, parseAbi, type Address, type Hash } from "viem";
import { appChain, contractAddress, isMainnet, rpcUrl, rodAddress, nftAddress, tokenAddress } from "@/lib/config";
import { loadGameSnapshot, publicClient, type LeaderboardEntry } from "@/lib/celo";
import { celoCatchAbi, fishingRodAbi } from "@/lib/contract";
import { ensureExpectedChain, getInjectedProvider, isMiniPayProvider, requestPrimaryAccount, type Eip1193Provider } from "@/lib/ethereum";
import { useAccount } from "wagmi";

const nftAbi = parseAbi(["function mintFish(uint256 id) external"]);
const tokenAbi = parseAbi(["function claimReward(uint256 fishId) external"]);

export type TabState = "pond" | "shop" | "nft" | "token" | "profile";
export type CatchResult = { fishType: number; name: string; emoji: string; xp: number; };

const fishGuide = [
  { type: 1, emoji: "🐟", name: "Tiny", xp: 10 }, { type: 2, emoji: "🐠", name: "Blue", xp: 25 },
  { type: 3, emoji: "🐡", name: "Puffer", xp: 75 }, { type: 4, emoji: "✨", name: "Golden", xp: 150 },
  { type: 5, emoji: "🦈", name: "Shark", xp: 350 }, { type: 6, emoji: "🐋", name: "Whale", xp: 1000 },
];

function readableError(error: unknown): string {
  if (error instanceof BaseError) return error.shortMessage;
  return error instanceof Error ? error.message : "Error";
}

export function useCeloCatch() {
  const providerRef = useRef<Eip1193Provider | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [miniPay, setMiniPay] = useState(false);
  const [status, setStatus] = useState("Checking your MiniPay wallet…");
  const [loading, setLoading] = useState(false);
  const [canCast, setCanCast] = useState(false);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [lastCatch, setLastCatch] = useState<CatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabState>("pond");
  const [playerXp, setPlayerXp] = useState<number>(0);

  const { address: wagmiAddress, connector } = useAccount();
  const configured = contractAddress !== null;
  const shortAccount = useMemo(() => (account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "—"), [account]);

  const refreshGame = useCallback(async (player?: Address | null) => {
    if (!configured) return;
    try {
      const snapshot = await loadGameSnapshot(player ?? undefined);
      setCanCast(snapshot.canCast);
      setLeaders(snapshot.leaders);
    } catch (error) { 
      console.error(error); 
      setCanCast(true); // Fallback: izinkan cast jika snapshot gagal
    } 
    if (player && contractAddress) {
      try {
        const xp = await publicClient.readContract({ address: contractAddress, abi: celoCatchAbi, functionName: "playerXP", args: [player] });
        setPlayerXp(Number(xp));
      } catch (e) { console.error(e); }
    }
  }, [configured]);

  useEffect(() => {
    async function sync() {
      if (wagmiAddress && connector) {
        const prov = await connector.getProvider();
        providerRef.current = prov as any;
        setAccount(wagmiAddress);
        setMiniPay(false);
        setStatus("Your cast is ready.");
        await refreshGame(wagmiAddress);
        return;
      }
      const provider = getInjectedProvider();
      if (provider) {
        providerRef.current = provider;
        setMiniPay(isMiniPayProvider(provider));
        const addr = await requestPrimaryAccount(provider);
        setAccount(addr);
        await ensureExpectedChain(provider, appChain, rpcUrl);
        setStatus("Your cast is ready.");
        await refreshGame(addr);
      } else {
        setStatus("Open Celo Catch from the MiniPay app to start fishing.");
      }
    }
    sync();
  }, [wagmiAddress, connector, refreshGame]);

  async function buyRod(id: number, price: string) {
    if (!providerRef.current || !account || !rodAddress) return;
    setLoading(true); setStatus("Minting...");
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: rodAddress, abi: fishingRodAbi, functionName: "buyRod", args: [BigInt(id)], value: parseEther(price) });
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStatus("Success");
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  async function equipRod(id: number) {
    if (!providerRef.current || !account || !contractAddress) return;
    setLoading(true);
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: contractAddress, abi: celoCatchAbi, functionName: "equipRod", args: [BigInt(id)] });
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStatus("Equipped");
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  async function upgradeRod(f: number, t: number) {
    if (!providerRef.current || !account || !rodAddress) return;
    setLoading(true);
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: rodAddress, abi: fishingRodAbi, functionName: "burnAndUpgrade", args: [BigInt(f), BigInt(t)] });
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStatus("Upgraded");
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  async function castLine() {
    if (!providerRef.current || !account || !contractAddress || !canCast) return;
    setLoading(true);
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: contractAddress, abi: celoCatchAbi, functionName: "recordCatch" });
      const r = await publicClient.waitForTransactionReceipt({ hash: h });
      let cT = 1; let cX = 10;
      for (const log of r.logs) {
        try {
          const d = decodeEventLog({ abi: celoCatchAbi, data: log.data, topics: log.topics });
          if (d.eventName === "FishCaught") { const a = d.args as any; cT = Number(a.fishType); cX = Number(a.xp); }
        } catch (e) {}
      }
      const cI = fishGuide.find((f) => f.type === cT) || fishGuide[0];
      setLastCatch({ fishType: cT, name: cI.name, emoji: cI.emoji, xp: cX });
      await refreshGame(account);
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  async function mintNft(id: number) {
    if (!providerRef.current || !account || !nftAddress) return;
    setLoading(true);
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: nftAddress, abi: nftAbi, functionName: "mintFish", args: [BigInt(id)] });
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStatus("Minted");
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  async function claimToken(id: number) {
    if (!providerRef.current || !account || !tokenAddress) return;
    setLoading(true);
    try {
      const wc = createWalletClient({ account, chain: appChain, transport: custom(providerRef.current) });
      const h = await wc.writeContract({ address: tokenAddress, abi: tokenAbi, functionName: "claimReward", args: [BigInt(id)] });
      await publicClient.waitForTransactionReceipt({ hash: h });
      setStatus("Claimed");
    } catch (e) { setStatus(readableError(e)); } finally { setLoading(false); }
  }

  return {
    miniPay, appChain, activeTab, setActiveTab, shortAccount, playerXp, loading, status, castLine,
    lastCatch, leaders, buyRod, equipRod, upgradeRod, mintNft, claimToken, contractAddress, rodAddress, isMainnet,
    castDisabled: loading || !account || !configured || !canCast
  };
}
