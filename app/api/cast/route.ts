import { NextResponse } from "next/server";
import { ethers } from "ethers";
import crypto from "crypto";

const fishTable = [
  { fishType: 1, name: "Tiny Fish", emoji: "🐟", xp: 10, weight: 4500 },
  { fishType: 2, name: "Blue Fish", emoji: "🐠", xp: 25, weight: 2500 },
  { fishType: 3, name: "Puffer Fish", emoji: "🐡", xp: 75, weight: 1500 },
  { fishType: 4, name: "Golden Fish", emoji: "✨🐟", xp: 150, weight: 900 },
  { fishType: 5, name: "Shark", emoji: "🦈", xp: 350, weight: 450 },
  { fishType: 6, name: "Whale Catch", emoji: "🐋", xp: 1000, weight: 100 },
  { fishType: 7, name: "Empty Hook", emoji: "🪝", xp: 0, weight: 50 }
];

function pickFish() {
  const total = fishTable.reduce((sum, fish) => sum + fish.weight, 0);
  let roll = crypto.randomInt(1, total + 1);

  for (const fish of fishTable) {
    roll -= fish.weight;
    if (roll <= 0) return fish;
  }

  return fishTable[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const account = body.account;

    if (!account || !ethers.isAddress(account)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const privateKey = process.env.SERVER_SIGNER_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 44787);

    if (!privateKey || !contractAddress) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const fish = pickFish();
    const nonce = BigInt("0x" + crypto.randomBytes(16).toString("hex")).toString();
    const deadline = Math.floor(Date.now() / 1000) + 10 * 60;

    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "address", "uint8", "uint256", "uint256", "uint256"],
      [
        contractAddress,
        chainId,
        account,
        fish.fishType,
        fish.xp,
        nonce,
        deadline
      ]
    );

    const digest = ethers.keccak256(encoded);

    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(ethers.getBytes(digest));

    return NextResponse.json({
      fishType: fish.fishType,
      name: fish.name,
      emoji: fish.emoji,
      xp: fish.xp,
      nonce,
      deadline,
      signature
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
