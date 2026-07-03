import { createHash, createHmac } from "node:crypto";

export type FishDefinition = {
  fishType: number;
  name: string;
  emoji: string;
  xp: number;
  weight: number;
};

export const fishTable: readonly FishDefinition[] = [
  { fishType: 1, name: "Tiny Fish", emoji: "🐟", xp: 10, weight: 4500 },
  { fishType: 2, name: "Blue Fish", emoji: "🐠", xp: 25, weight: 2500 },
  { fishType: 3, name: "Puffer Fish", emoji: "🐡", xp: 75, weight: 1500 },
  { fishType: 4, name: "Golden Fish", emoji: "✨", xp: 150, weight: 900 },
  { fishType: 5, name: "Shark", emoji: "🦈", xp: 350, weight: 450 },
  { fishType: 6, name: "Whale Catch", emoji: "🐋", xp: 1000, weight: 100 },
  { fishType: 7, name: "Empty Hook", emoji: "🪝", xp: 0, weight: 50 },
] as const;

export type DailyCatch = Omit<FishDefinition, "weight"> & { nonce: string };

type DailyCatchInput = {
  account: string;
  contractAddress: string;
  chainId: number;
  day: number;
  secret: string;
};

export function createDailyCatch(input: DailyCatchInput): DailyCatch {
  const normalized = [input.chainId, input.contractAddress.toLowerCase(), input.account.toLowerCase(), input.day].join(":");
  const seed = createHmac("sha256", input.secret).update(normalized).digest("hex");
  const totalWeight = fishTable.reduce((sum, fish) => sum + fish.weight, 0);
  let roll = Number(BigInt(`0x${seed}`) % BigInt(totalWeight)) + 1;

  const selected = fishTable.find((fish) => {
    roll -= fish.weight;
    return roll <= 0;
  }) ?? fishTable[0];

  const nonceHex = createHash("sha256").update(`celo-catch:${seed}:nonce`).digest("hex");
  return {
    fishType: selected.fishType,
    name: selected.name,
    emoji: selected.emoji,
    xp: selected.xp,
    nonce: BigInt(`0x${nonceHex}`).toString(),
  };
}
