import { describe, expect, it } from "vitest";
import { celo, celoSepolia } from "viem/chains";
import {
  ensureExpectedChain,
  requestPrimaryAccount,
  WalletNetworkError,
  type Eip1193Provider,
  type ProviderRequest,
} from "../lib/ethereum";

const wallet = "0x1111111111111111111111111111111111111111";

function createProvider(
  handler: (request: ProviderRequest) => unknown | Promise<unknown>,
  isMiniPay = false,
): Eip1193Provider {
  return { isMiniPay, request: async (request) => handler(request) };
}

describe("MiniPay provider handling", () => {
  it("reads the automatically injected account", async () => {
    const provider = createProvider(({ method }) =>
      method === "eth_requestAccounts" ? [wallet] : null,
    true);
    await expect(requestPrimaryAccount(provider)).resolves.toBe(wallet);
  });

  it("does not attempt chain switching inside MiniPay", async () => {
    const methods: string[] = [];
    const provider = createProvider(({ method }) => {
      methods.push(method);
      if (method === "eth_chainId") return `0x${celo.id.toString(16)}`;
      throw new Error(`Unexpected method: ${method}`);
    }, true);

    await expect(
      ensureExpectedChain(provider, celoSepolia, "https://example.test"),
    ).rejects.toBeInstanceOf(WalletNetworkError);
    expect(methods).toEqual(["eth_chainId"]);
  });

  it("switches a regular injected wallet when needed", async () => {
    const methods: string[] = [];
    const provider = createProvider(({ method }) => {
      methods.push(method);
      if (method === "eth_chainId") return "0x1";
      if (method === "wallet_switchEthereumChain") return null;
      throw new Error(`Unexpected method: ${method}`);
    });

    await ensureExpectedChain(provider, celo, "https://forno.celo.org");
    expect(methods).toEqual(["eth_chainId", "wallet_switchEthereumChain"]);
  });
});
