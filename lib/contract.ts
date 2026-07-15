import { parseAbi, parseAbiItem } from "viem";

export const celoCatchAbi = parseAbi([
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
