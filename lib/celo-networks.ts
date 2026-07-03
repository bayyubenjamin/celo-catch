import { celo, celoSepolia } from "viem/chains";

export const CELO_ECOSYSTEM = {
  name: "Celo",
  slug: "celo",
  chainNamespace: "eip155",
  primaryChainId: celo.id,
  testChainId: celoSepolia.id,
  caip2: {
    mainnet: "eip155:42220",
    testnet: "eip155:11142220",
  },
  wallet: "MiniPay",
  applicationType: "consumer-onchain-game",
} as const;

export const SUPPORTED_CELO_CHAINS = [celo, celoSepolia] as const;

export function resolveCeloChain(chainId: number) {
  return chainId === celo.id ? celo : celoSepolia;
}

export function isSupportedCeloChain(chainId: number): boolean {
  return SUPPORTED_CELO_CHAINS.some((chain) => chain.id === chainId);
}
