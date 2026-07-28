import { describe, expect, it } from "vitest";
import { encodeAbiParameters, encodeEventTopics, parseAbiParameters, type Hex } from "viem";
import { extractFishCaughtFromReceipt, fishCaughtEvent } from "../lib/contract";

describe("FishCaught receipt parsing", () => {
  it("extracts fish type and xp from FishCaught logs", () => {
    const player = "0x1111111111111111111111111111111111111111" as const;
    const topics = encodeEventTopics({
      abi: [fishCaughtEvent],
      eventName: "FishCaught",
      args: [player],
    });
    const data = encodeAbiParameters(parseAbiParameters("uint8 fishType, uint256 xp"), [4, 150n]);

    const receipt = {
      logs: [
        {
          data,
          topics,
        } as { data: Hex; topics: readonly Hex[] },
      ],
    };

    expect(extractFishCaughtFromReceipt(receipt)).toEqual({ fishType: 4, xp: 150 });
  });
});
