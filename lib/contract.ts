import { parseAbi, parseAbiItem } from "viem";

export const celoCatchAbi = parseAbi([
  // ABI recordCatch diupdate untuk menerima 6 argumen sesuai arsitektur V2
  "function recordCatch(uint8 fishType, uint256 xp, uint256 nonce, uint256 day, uint256 deadline, bytes signature) external",
  "function equipRod(uint256 rodId) external",
  "function playerXP(address player) view returns (uint256)",
  "function playerRod(address player) view returns (uint256)",
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)",
] as const);

export const fishCaughtEvent = parseAbiItem(
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)" as const
);
