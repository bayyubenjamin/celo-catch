// src/hooks/useCeloCatch.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAccount, useReadContract, useWriteContract, useBalance } from "wagmi";

const CORE_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CORE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
const NFT_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

const coreAbi = [
  { type: "function", name: "castLine", inputs: [], outputs: [] },
  { type: "function", name: "buyRod", inputs: [{ name: "rodId", type: "uint256" }], outputs: [] },
  { type: "function", name: "equipRod", inputs: [{ name: "rodId", type: "uint256" }], outputs: [] },
  { type: "function", name: "upgradeRod", inputs: [{ name: "rodId", type: "uint256" }], outputs: [] },
  { type: "function", name: "claimReward", inputs: [], outputs: [] },
  { type: "function", name: "getPlayerInfo", inputs: [{ name: "player", type: "address" }], outputs: [{ name: "xp", type: "uint256" }, { name: "lastCatch", type: "uint256" }] }
] as const;

const nftAbi = [
  { type: "function", name: "mint", inputs: [], outputs: [] }
] as const;

export function useCeloCatch() {
  const [activeTab, setActiveTab] = useState("Pond");
  const [status, setStatus] = useState("Idle");
  const [xp, setXp] = useState(0);
  const [lastCatch, setLastCatch] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<{address: string, xp: number}[]>([]);
  const providerRef = useRef<any>(null);

  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { writeContractAsync } = useWriteContract();

  const { data: playerInfo, refetch: refetchPlayerInfo } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: coreAbi,
    functionName: "getPlayerInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const refreshGame = useCallback(async () => {
    if (!address) return;
    setStatus("Refreshing...");
    await refetchPlayerInfo();
    setStatus("Idle");
  }, [address, refetchPlayerInfo]);

  useEffect(() => {
    if (playerInfo) {
      // Type-casting paling aman agar TS tidak error index '0'
      const data = playerInfo as unknown as any[];
      setXp(Number(data[0] || 0));
      setLastCatch(Number(data[1] || 0));
    }
  }, [playerInfo]);

  const castLine = useCallback(async () => {
    if (!address) return;
    try {
      setStatus("Casting line...");
      const hash = await writeContractAsync({
        address: CORE_CONTRACT_ADDRESS,
        abi: coreAbi,
        functionName: "castLine",
      });
      setStatus(`Line cast! Tx: ${hash}`);
      await refreshGame();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync, refreshGame]);

  const buyRod = useCallback(async (rodId: number) => {
    if (!address) return;
    try {
      setStatus("Buying rod...");
      const hash = await writeContractAsync({
        address: CORE_CONTRACT_ADDRESS,
        abi: coreAbi,
        functionName: "buyRod",
        args: [BigInt(rodId)],
      });
      setStatus(`Rod bought! Tx: ${hash}`);
      await refreshGame();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync, refreshGame]);

  const equipRod = useCallback(async (rodId: number) => {
    if (!address) return;
    try {
      setStatus("Equipping rod...");
      const hash = await writeContractAsync({
        address: CORE_CONTRACT_ADDRESS,
        abi: coreAbi,
        functionName: "equipRod",
        args: [BigInt(rodId)],
      });
      setStatus(`Rod equipped! Tx: ${hash}`);
      await refreshGame();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync, refreshGame]);

  const upgradeRod = useCallback(async (rodId: number) => {
    if (!address) return;
    try {
      setStatus("Upgrading rod...");
      const hash = await writeContractAsync({
        address: CORE_CONTRACT_ADDRESS,
        abi: coreAbi,
        functionName: "upgradeRod",
        args: [BigInt(rodId)],
      });
      setStatus(`Rod upgraded! Tx: ${hash}`);
      await refreshGame();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync, refreshGame]);

  const mintNft = useCallback(async () => {
    if (!address) return;
    try {
      setStatus("Minting NFT...");
      const hash = await writeContractAsync({
        address: NFT_CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "mint",
      });
      setStatus(`NFT Minted! Tx: ${hash}`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync]);

  const claimToken = useCallback(async () => {
    if (!address) return;
    try {
      setStatus("Claiming reward...");
      const hash = await writeContractAsync({
        address: CORE_CONTRACT_ADDRESS,
        abi: coreAbi,
        functionName: "claimReward",
      });
      setStatus(`Reward claimed! Tx: ${hash}`);
      await refreshGame();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  }, [address, writeContractAsync, refreshGame]);

  const displayBalance = useMemo(() => {
    if (!balanceData) return "0.00";
    return Number(balanceData.formatted).toFixed(4);
  }, [balanceData]);

  return {
    activeTab,
    setActiveTab,
    status,
    xp,
    lastCatch,
    leaderboard,
    address,
    isConnected,
    displayBalance,
    providerRef,
    refreshGame,
    castLine,
    buyRod,
    equipRod,
    upgradeRod,
    mintNft,
    claimToken,
  };
}
