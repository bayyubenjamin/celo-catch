import { isAddress, type Address } from "viem";
import { celo, celoSepolia } from "viem/chains";
import { resolveCeloChain } from "./celo-networks";

// Default ke Celo Mainnet (42220) karena sudah live
const requestedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? celo.id);

export const appChain = resolveCeloChain(requestedChainId);
export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? appChain.rpcUrls.default.http[0];

// Konfigurasi 4 Smart Contract dari Mainnet
export const coreAddress: Address | null = isAddress(process.env.NEXT_PUBLIC_CORE_ADDRESS ?? "") 
  ? (process.env.NEXT_PUBLIC_CORE_ADDRESS as Address) 
  : null;

export const rodAddress: Address | null = isAddress(process.env.NEXT_PUBLIC_ROD_ADDRESS ?? "") 
  ? (process.env.NEXT_PUBLIC_ROD_ADDRESS as Address) 
  : null;

export const nftAddress: Address | null = isAddress(process.env.NEXT_PUBLIC_NFT_ADDRESS ?? "") 
  ? (process.env.NEXT_PUBLIC_NFT_ADDRESS as Address) 
  : null;

export const tokenAddress: Address | null = isAddress(process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") 
  ? (process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address) 
  : null;

// Alias contractAddress diarahkan ke Core agar fitur memancing yang lama tetap berfungsi normal
export const contractAddress = coreAddress;

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
