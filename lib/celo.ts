import { createPublicClient, http, type Address } from "viem";
import { appChain, contractAddress, contractStartBlock, rpcUrl } from "./config";
import { celoCatchAbi, fishCaughtEvent } from "./contract";

export type LeaderboardEntry = {
  address: Address;
  xp: number;
  casts: number;
};

export type GameSnapshot = {
  totalCasts: number;
  canCast: boolean;
  leaders: LeaderboardEntry[];
};

export const publicClient = createPublicClient({
  chain: appChain,
  transport: http(rpcUrl, { timeout: 20_000 }), // Timeout diperpanjang biar makin stabil
});

export async function loadGameSnapshot(player?: Address): Promise<GameSnapshot> {
  if (!contractAddress) return { totalCasts: 0, canCast: false, leaders: [] };

  const leaders = await loadLeaderboard(publicClient);
  const totalCasts = leaders.reduce((sum, leader) => sum + leader.casts, 0);

  return { totalCasts, canCast: true, leaders };
}

async function loadLeaderboard(client: typeof publicClient): Promise<LeaderboardEntry[]> {
  if (!contractAddress) return [];

  const latestBlock = await client.getBlockNumber();
  
  // LOGIKA SMART FALLBACK:
  // Kalau tidak ada START_BLOCK (0), kita mulai dari 100.000 blok terakhir saja
  // Biar gak timeout/lelet, tapi leaderboard tetap muncul.
  let fromBlock = contractStartBlock;
  if (fromBlock === 0n) {
    fromBlock = latestBlock > 100000n ? latestBlock - 100000n : 0n;
  }

  const chunkSize = 25_000n;
  const aggregate = new Map<string, LeaderboardEntry>();

  for (let currentBlock = fromBlock; currentBlock <= latestBlock; currentBlock += chunkSize) {
    const toBlock = currentBlock + chunkSize - 1n > latestBlock
      ? latestBlock
      : currentBlock + chunkSize - 1n;
      
    try {
      const logs = await client.getLogs({
        address: contractAddress,
        event: fishCaughtEvent,
        fromBlock: currentBlock,
        toBlock,
      });

      for (const log of logs) {
        const player = log.args.player;
        const xp = log.args.xp;
        if (!player || xp === undefined) continue;

        const key = player.toLowerCase();
        const current = aggregate.get(key) ?? { address: player, xp: 0, casts: 0 };
        current.xp += Number(xp);
        current.casts += 1;
        aggregate.set(key, current);
      }
    } catch (e) {
      console.warn("Skip chunk karena RPC limit:", e);
    }
  }

  return [...aggregate.values()]
    .sort((left, right) => right.xp - left.xp || right.casts - left.casts)
    .slice(0, 20);
}
