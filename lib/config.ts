import { isAddress, type Address } from "viem";
import { celo, celoSepolia } from "viem/chains";
import { resolveCeloChain } from "./celo-networks";

const requestedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? celoSepolia.id);

export const appChain = resolveCeloChain(requestedChainId);
export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? appChain.rpcUrls.default.http[0];

const configuredAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export const contractAddress: Address | null = isAddress(configuredAddress)
  ? configuredAddress
  : null;

export const contractStartBlock = parseStartBlock(process.env.NEXT_PUBLIC_START_BLOCK);
export const isMainnet = appChain.id === celo.id;

function parseStartBlock(value: string | undefined): bigint {
  if (!value) return 0n;

  try {
    const parsed = BigInt(value);
    return parsed >= 0n ? parsed : 0n;
  } catch {
    return 0n;
  }
}
