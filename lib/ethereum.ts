import type { Address, Chain } from "viem";
import { getAddress, isAddress } from "viem";

export type ProviderRequest = {
  method: string;
  params?: readonly unknown[] | Record<string, unknown>;
};

export interface Eip1193Provider {
  isMiniPay?: boolean;
  request(args: ProviderRequest): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export class WalletNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletNetworkError";
  }
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function isMiniPayProvider(provider: Eip1193Provider): boolean {
  return provider.isMiniPay === true;
}

export async function requestPrimaryAccount(provider: Eip1193Provider): Promise<Address> {
  const response = await provider.request({ method: "eth_requestAccounts" });

  if (!Array.isArray(response) || typeof response[0] !== "string") {
    throw new Error("MiniPay did not return a wallet address.");
  }

  if (!isAddress(response[0])) {
    throw new Error("The injected wallet returned an invalid address.");
  }

  return getAddress(response[0]);
}

export async function getProviderChainId(provider: Eip1193Provider): Promise<number> {
  const response = await provider.request({ method: "eth_chainId" });
  if (typeof response !== "string") {
    throw new Error("The wallet returned an invalid network response.");
  }

  const parsed = Number.parseInt(response, 16);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error("The wallet returned an invalid chain ID.");
  }
  return parsed;
}

export async function ensureExpectedChain(
  provider: Eip1193Provider,
  chain: Chain,
  preferredRpcUrl: string,
): Promise<void> {
  const currentChainId = await getProviderChainId(provider);
  if (currentChainId === chain.id) return;

  if (isMiniPayProvider(provider)) {
    const action = chain.id === 11142220
      ? "Enable Use Testnet in MiniPay Developer Settings."
      : "Disable Use Testnet in MiniPay Developer Settings.";
    throw new WalletNetworkError(`MiniPay is on the wrong network. ${action}`);
  }

  const hexChainId = `0x${chain.id.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (error) {
    const code = getErrorCode(error);
    if (code !== 4902) throw error;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: hexChainId,
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: [preferredRpcUrl],
        blockExplorerUrls: chain.blockExplorers
          ? [chain.blockExplorers.default.url]
          : [],
      }],
    });
  }
}

function getErrorCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "number" ? error.code : undefined;
}
