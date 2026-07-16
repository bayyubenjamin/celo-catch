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
  transport: http(rpcUrl, { timeout: 12_000 }),
});

export async function loadGameSnapshot(player?: Address): Promise<GameSnapshot> {
  if (!contractAddress) return { totalCasts: 0, canCast: false, leaders: [] };

  // Karena "totalCasts" dan "canCast" sudah tidak ada di smart contract yang baru,
  // kita hanya perlu memuat Leaderboard saja dari riwayat event (log).
  const leaders = await loadLeaderboard(publicClient);

  // Kita hitung totalCasts dari semua aktivitas di Leaderboard
  const totalCasts = leaders.reduce((acc, current) => acc + current.casts, 0);

  return { 
    totalCasts, 
    canCast: true, // Bypass canCast menjadi true agar user bebas memancing di UI
    leaders 
  };
}

async function loadLeaderboard(client: typeof publicClient): Promise<LeaderboardEntry[]> {
  if (!contractAddress) return [];

  const latestBlock = await client.getBlockNumber();
  if (contractStartBlock > latestBlock) return [];

  const chunkSize = 25_000n;
  const aggregate = new Map<string, LeaderboardEntry>();

  for (let fromBlock = contractStartBlock; fromBlock <= latestBlock; fromBlock += chunkSize) {
    const toBlock = fromBlock + chunkSize - 1n > latestBlock
      ? latestBlock
      : fromBlock + chunkSize - 1n;
    const logs = await client.getLogs({
      address: contractAddress,
      event: fishCaughtEvent,
      fromBlock,
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
  }

  return [...aggregate.values()]
    .sort((left, right) => right.xp - left.xp || right.casts - left.casts)
    .slice(0, 20);
}
