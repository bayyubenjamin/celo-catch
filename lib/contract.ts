import { parseAbi, parseAbiItem } from "viem";

export const celoCatchAbi = parseAbi([
  "function recordCatch() external",
  "function equipRod(uint256 rodId) external",
  "function playerXP(address player) view returns (uint256)",
  "function playerRod(address player) view returns (uint256)",
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)",
] as const);

export const fishCaughtEvent = parseAbiItem(
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp)" as const
);
