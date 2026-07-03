# Celo Ecosystem Classification

Celo Catch is a Celo-specific consumer application. It is not a generic multi-chain template and it does not currently target any non-Celo production network.

This document provides a concise evidence map for repository indexers, ecosystem reviewers, automated classifiers, and contributors.

## Primary ecosystem

| Field | Value |
|---|---|
| Ecosystem | Celo |
| Primary production network | Celo Mainnet |
| Mainnet chain ID | `42220` |
| Mainnet CAIP-2 identifier | `eip155:42220` |
| Development network | Celo Sepolia |
| Testnet chain ID | `11142220` |
| Testnet CAIP-2 identifier | `eip155:11142220` |
| Primary wallet runtime | MiniPay |
| Contract language | Solidity |
| Transaction library | Viem |
| Multi-chain project | No |

## Why this repository belongs to the Celo ecosystem

### 1. Celo network identity is encoded in application code

`lib/celo-networks.ts` declares Celo Mainnet and Celo Sepolia as the only supported chains. It includes their chain IDs and CAIP-2 identifiers.

`lib/config.ts` resolves the runtime network through that Celo-specific module and defaults development activity to Celo Sepolia.

### 2. MiniPay is the primary application environment

`lib/ethereum.ts` integrates with the provider injected by MiniPay through `window.ethereum` and checks the `isMiniPay` flag.

The application uses Viem for wallet and contract transactions because the wallet flow is designed around MiniPay and Celo fee-abstraction compatibility.

### 3. The contract is designed for deployment on Celo

`contracts/CeloCatch.sol` is the onchain source of truth for daily catches, XP, nonce protection, and server-signed results.

Version 1.0.0 includes the reviewed source and contract compilation tests. Deployment is intentionally deferred to Version 1.1.0 on Celo Sepolia.

### 4. Celo integration is covered by automated tests

`tests/celo-ecosystem.test.ts` verifies:

- Celo Mainnet chain ID `42220`;
- Celo Sepolia chain ID `11142220`;
- CAIP-2 identifiers for both networks;
- rejection of unrelated chains;
- Celo Sepolia as the development fallback.

MiniPay provider behavior is tested separately in `tests/ethereum.test.ts`.

### 5. Repository metadata is explicit and machine-readable

The repository exposes the same project classification through:

- `project.json`;
- `celo.json`;
- `.github/PROJECT_METADATA.yml`;
- `package.json` keywords and repository metadata;
- the ecosystem section in `README.md`.

These files are descriptive metadata. The authoritative technical evidence remains the implementation and tests.

## Evidence index

| Evidence | Repository path |
|---|---|
| Celo network constants | `lib/celo-networks.ts` |
| Runtime chain selection | `lib/config.ts` |
| MiniPay provider integration | `lib/ethereum.ts` |
| Celo public client and event reads | `lib/celo.ts` |
| Smart contract source | `contracts/CeloCatch.sol` |
| Celo chain identity tests | `tests/celo-ecosystem.test.ts` |
| MiniPay provider tests | `tests/ethereum.test.ts` |
| Signature compatibility test | `tests/signature.test.ts` |
| Machine-readable project manifest | `project.json` |
| Celo release metadata | `celo.json` |
| CI verification | `.github/workflows/verify.yml` |

## Deployment state

Version 1.0.0 is the MiniPay-native application foundation.

Current state:

- Celo-specific application source: complete;
- MiniPay integration: implemented;
- Solidity contract: implemented and compile-tested;
- Celo Sepolia deployment: not yet completed;
- Celo Mainnet deployment: not yet completed;
- live contract addresses: none.

No deployment address is published until an actual transaction and explorer record exist.

## Verification

Run the complete repository verification pipeline:

```bash
npm run verify
```

The pipeline performs strict type checking, unit tests, Celo identity tests, MiniPay provider tests, signature compatibility tests, Solidity compilation, MiniPay readiness checks, and a production Next.js build.

## Recommended GitHub repository topics

The following topics accurately describe this repository:

```text
celo
celo-blockchain
celo-sepolia
minipay
minipay-miniapp
onchain-game
consumer-crypto
solidity
viem
nextjs
```

Repository topics are discovery metadata only. They do not replace working Celo code, contract deployment evidence, or verified onchain activity.
