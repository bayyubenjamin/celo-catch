import { describe, expect, it } from "vitest";
import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  recoverMessageAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const parameters = parseAbiParameters(
  "address contractAddress, uint256 chainId, address player, uint8 fishType, uint256 xp, uint256 nonce, uint256 day, uint256 deadline",
);

describe("server catch signature", () => {
  it("recovers the signer expected by Solidity EIP-191 verification", async () => {
    const signer = privateKeyToAccount(
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    );
    const encoded = encodeAbiParameters(parameters, [
      "0x2222222222222222222222222222222222222222",
      11142220n,
      "0x1111111111111111111111111111111111111111",
      4,
      150n,
      123n,
      20_700n,
      1_800_000_000n,
    ]);
    const digest = keccak256(encoded);
    const signature = await signer.signMessage({ message: { raw: digest } });
    const recovered = await recoverMessageAddress({ message: { raw: digest }, signature });

    expect(recovered).toBe(signer.address);
  });
});
