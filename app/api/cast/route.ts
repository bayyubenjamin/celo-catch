import { NextResponse } from "next/server";
import {
  encodeAbiParameters,
  isAddress,
  keccak256,
  parseAbiParameters,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createDailyCatch } from "@/lib/catch-result";
import { appChain, contractAddress } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const signedCatchParameters = parseAbiParameters(
  "address contractAddress, uint256 chainId, address player, uint8 fishType, uint256 xp, uint256 nonce, uint256 day, uint256 deadline",
);

type CastRequest = { account?: unknown };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CastRequest;
    const account = typeof body.account === "string" ? body.account : "";

    if (!isAddress(account)) return json({ error: "Invalid wallet address." }, 400);
    if (!contractAddress) {
      return json({ error: "The game contract has not been configured yet." }, 503);
    }

    const privateKey = normalizePrivateKey(process.env.SERVER_SIGNER_PRIVATE_KEY);
    const randomnessSecret = process.env.SERVER_RANDOMNESS_SECRET;
    if (!privateKey || !randomnessSecret || randomnessSecret.length < 32) {
      console.error("Celo Catch server signer or randomness secret is missing.");
      return json({ error: "The cast service is not configured yet." }, 503);
    }

    const now = Math.floor(Date.now() / 1000);
    const day = Math.floor(now / 86_400);
    const deadline = now + 10 * 60;
    const dailyCatch = createDailyCatch({
      account,
      contractAddress,
      chainId: appChain.id,
      day,
      secret: randomnessSecret,
    });

    const encoded = encodeAbiParameters(signedCatchParameters, [
      contractAddress,
      BigInt(appChain.id),
      account,
      dailyCatch.fishType,
      BigInt(dailyCatch.xp),
      BigInt(dailyCatch.nonce),
      BigInt(day),
      BigInt(deadline),
    ]);

    const digest = keccak256(encoded);
    const signer = privateKeyToAccount(privateKey);
    const signature = await signer.signMessage({ message: { raw: digest } });

    return json({ ...dailyCatch, day, deadline, signature });
  } catch (error) {
    console.error("Failed to create a signed catch result", error);
    return json({ error: "Unable to prepare this cast. Please try again." }, 500);
  }
}

function normalizePrivateKey(value: string | undefined): Hex | null {
  if (!value) return null;
  const normalized = value.startsWith("0x") ? value : `0x${value}`;
  return /^0x[0-9a-fA-F]{64}$/.test(normalized) ? (normalized as Hex) : null;
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
