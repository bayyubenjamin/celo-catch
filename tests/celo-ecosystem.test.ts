import { describe, expect, it } from "vitest";
import { celo, celoSepolia } from "viem/chains";
import {
  CELO_ECOSYSTEM,
  isSupportedCeloChain,
  resolveCeloChain,
} from "../lib/celo-networks";

describe("Celo ecosystem identity", () => {
  it("uses the official Celo chain identifiers", () => {
    expect(CELO_ECOSYSTEM.primaryChainId).toBe(42220);
    expect(CELO_ECOSYSTEM.testChainId).toBe(11142220);
    expect(CELO_ECOSYSTEM.caip2.mainnet).toBe("eip155:42220");
    expect(CELO_ECOSYSTEM.caip2.testnet).toBe("eip155:11142220");
  });

  it("supports only Celo Mainnet and Celo Sepolia", () => {
    expect(isSupportedCeloChain(celo.id)).toBe(true);
    expect(isSupportedCeloChain(celoSepolia.id)).toBe(true);
    expect(isSupportedCeloChain(1)).toBe(false);
  });

  it("falls back to Celo Sepolia for non-mainnet development", () => {
    expect(resolveCeloChain(celo.id).id).toBe(celo.id);
    expect(resolveCeloChain(1).id).toBe(celoSepolia.id);
  });
});
