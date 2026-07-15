import { parseAbi, parseAbiItem } from "viem";

export const celoCatchAbi = parseAbi([
  "function recordCatch(uint8 fishType, uint256 xp, uint256 nonce, uint256 day, uint256 deadline, bytes signature)",
  "function canCast(address player) view returns (bool)",
  "function totalCasts() view returns (uint256)",
  "function playerXP(address player) view returns (uint256)",
  "function playerCasts(address player) view returns (uint256)",
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp, uint256 day, uint256 nonce, uint256 timestamp)",
]);

export const fishCaughtEvent = parseAbiItem(
  "event FishCaught(address indexed player, uint8 fishType, uint256 xp, uint256 day, uint256 nonce, uint256 timestamp)",
);
