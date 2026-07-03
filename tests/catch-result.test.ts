import { describe, expect, it } from "vitest";
import { createDailyCatch, fishTable } from "@/lib/catch-result";

const input = {
  account: "0x1111111111111111111111111111111111111111",
  contractAddress: "0x2222222222222222222222222222222222222222",
  chainId: 11142220,
  day: 20_700,
  secret: "this-is-a-long-test-secret-with-more-than-32-characters",
};

describe("daily catch generation", () => {
  it("returns the same result for the same wallet and UTC day", () => {
    expect(createDailyCatch(input)).toEqual(createDailyCatch(input));
  });

  it("creates a different nonce for a different day", () => {
    const today = createDailyCatch(input);
    const tomorrow = createDailyCatch({ ...input, day: input.day + 1 });
    expect(tomorrow.nonce).not.toBe(today.nonce);
  });

  it("keeps fish weights normalized to 10,000", () => {
    const total = fishTable.reduce((sum, fish) => sum + fish.weight, 0);
    expect(total).toBe(10_000);
  });
});
