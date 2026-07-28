import { decodeEventLog, parseAbi, parseAbiItem, type Hex } from "viem";

export const celoCatchAbi = parseAbi([
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)",
  "function recordCatch() external", // Sudah tidak butuh argumen (on-chain randomness)
  "function equipRod(uint256 rodId) external",
  "function playerXP(address player) view returns (uint256)",
  "function playerRod(address player) view returns (uint256)",
] as const);

// Tambahan ABI khusus untuk kontrak pancingan
export const fishingRodAbi = parseAbi([
  "function buyRod(uint256 id) external payable",
  "function burnAndUpgrade(uint256 fromId, uint256 toId) external",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
] as const);

export const fishCaughtEvent = parseAbiItem(
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)" as const
);

export type FishCaughtLog = {
  fishType: number;
  xp: number;
};

export function extractFishCaughtFromReceipt(receipt: { logs?: Array<{ data?: Hex; topics?: readonly Hex[] }> }) {
  for (const log of receipt.logs ?? []) {
    try {
      const decoded = decodeEventLog({
        abi: celoCatchAbi,
        data: log.data ?? "0x",
        topics: [...(log.topics ?? [])] as [Hex, ...Hex[]],
      });

      if (decoded.eventName === "FishCaught") {
        const args = decoded.args as { fishType?: number | bigint; xp?: number | bigint };
        return {
          fishType: Number(args.fishType ?? 0),
          xp: Number(args.xp ?? 0),
        } satisfies FishCaughtLog;
      }
    } catch {
      // Ignore logs that do not belong to the expected event.
    }
  }

  return null;
}
