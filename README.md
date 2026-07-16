# Celo Catch

![Celo Ecosystem](https://img.shields.io/badge/ecosystem-Celo-35D07F)
![Celo Mainnet](https://img.shields.io/badge/Celo%20Mainnet-42220-476520)
![MiniPay](https://img.shields.io/badge/wallet-MiniPay-5A31F4)
![Version](https://img.shields.io/badge/version-1.2.0-1F2937)
![Status](https://img.shields.io/badge/status-Mainnet%20Live-success)

**Celo Catch is a Celo-native, MiniPay-first consumer application.** It is a daily onchain fishing game designed specifically for Celo Mainnet. The repository is not a generic multi-chain template.

The product turns a simple mobile game loop into a lightweight onchain experience: open the app, receive one daily catch, earn XP, and build a public participation history.

> **Current release: Version 1.2.0 — Mainnet Live**
>
> Celo Catch is actively deployed on Celo Mainnet. The application operates on a highly modular smart contract architecture, native MiniPay wallet integration, and server-signed payload verifications to ensure security and gas efficiency.

## Modular Smart Contract Architecture

To ensure optimal security, upgradability, and a strict separation of concerns, the legacy monolithic contract has been deprecated. The ecosystem is now powered by four specialized smart contracts located in the `contracts/` directory:

1. **`CeloCatchCore.sol` (The Hub)**
   The primary entry point and orchestrator of the ecosystem. It verifies server-signed payloads, enforces the "one-cast-per-day" rule, manages the core user state, and securely bridges cross-contract communications.
2. **`CeloCatchToken.sol` (The Economy)**
   The native utility token contract governing the economic layer of Celo Catch. It handles reward distribution, in-game currency balances, and facilitates user-driven economic activities.
3. **`CeloCatchNFT.sol` (The Assets)**
   The Non-Fungible Token (NFT) contract representing true ownership of unique digital assets (e.g., rare catches, badges) within the platform. It ensures the provenance and authenticity of all minted items.
4. **`FishingRod.sol` (The Utility)**
   A specialized mechanics contract governing the primary tool used by players. It manages the attributes, levels, durability, and computational logic of the fishing rods, directly influencing interaction outcomes.

## Celo ecosystem identity

| Classification | Value |
|---|---|
| Primary ecosystem | **Celo** |
| Blockchain namespace | `eip155` |
| Production network | Celo Mainnet |
| Mainnet chain ID | `42220` |
| Mainnet CAIP-2 | `eip155:42220` |
| Primary wallet runtime | MiniPay |
| Transaction library | Viem |
| Smart contract language | Solidity |
| Contract deployment | **Mainnet Live** |

### Technical evidence

| Celo evidence | Source |
|---|---|
| Celo Mainnet identity | [`lib/celo-networks.ts`](lib/celo-networks.ts) |
| Runtime Celo chain selection | [`lib/config.ts`](lib/config.ts) |
| MiniPay injected-provider integration | [`lib/ethereum.ts`](lib/ethereum.ts) |
| Modular smart contract sources | [`contracts/`](contracts/) |
| Celo chain identity tests | [`tests/celo-ecosystem.test.ts`](tests/celo-ecosystem.test.ts) |
| Full CI verification | [`.github/workflows/verify.yml`](.github/workflows/verify.yml) |

## Product principles

Celo Catch is designed around four principles:

1. **Celo native** — network configuration, wallet behavior, contract flow, and testing are specifically designed for Celo.
2. **Mobile first** — the primary environment is MiniPay, not a desktop wallet dashboard.
3. **Low friction** — users do not need to understand bridges, gas markets, or complex DeFi terminology.
4. **Verifiable gameplay** — valid catches can be recorded and independently verified on Celo Mainnet.

## Security model

### Deterministic daily result
A wallet receives the same fish and nonce for the same UTC day. Repeated requests cannot be used to reroll the API until a rare fish appears. The result is derived from:
- Celo chain ID;
- `CeloCatchCore` contract address;
- player address;
- UTC day;
- private server randomness secret.

### Signed payload
Each catch signature securely binds:
- `CeloCatchCore` contract address;
- Celo chain ID;
- player address;
- fish type;
- XP amount;
- nonce;
- UTC day;
- expiration deadline.

### Contract enforcement
`contracts/CeloCatchCore.sol` strictly enforces:
- one cast per wallet per UTC day;
- fish-to-XP validation;
- signature expiration and nonce replay protection;
- server signer verification (low-`s` ECDSA validation);
- owner-controlled signer rotation.

## Repository structure

```text
app/                           Next.js routes, metadata, and API endpoint
components/                    MiniPay-first application interface
contracts/                     Modular contracts (Core, Token, NFT, FishingRod)
lib/celo-networks.ts           Canonical Celo ecosystem identity
lib/config.ts                  Runtime Celo chain configuration
lib/ethereum.ts                MiniPay injected-provider handling
lib/celo.ts                    Celo RPC reads and event aggregation
scripts/                       Contract and MiniPay verification scripts
tests/                         Automated test suites
CHANGELOG.md                   Version history

```

## Local development

Requirements:

* Node.js 20.9 or newer
* npm

```bash
npm install
cp .env.example .env.local
npm run dev

```

Open `http://localhost:3000`.

## Environment configuration

To run the application connected to Celo Mainnet, configure the modular contract addresses and server secrets in your `.env` file:

```dotenv
SERVER_SIGNER_PRIVATE_KEY=
SERVER_RANDOMNESS_SECRET=

NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_RPC_URL=[https://forno.celo.org](https://forno.celo.org)
NEXT_PUBLIC_START_BLOCK=

NEXT_PUBLIC_CORE_ADDRESS=
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_NFT_ADDRESS=
NEXT_PUBLIC_ROD_ADDRESS=

```

*Never expose server secrets using the `NEXT_PUBLIC_` prefix.*

## Verification

Run the complete verification pipeline:

```bash
npm run verify

```

The command performs strict TypeScript checking, deterministic catch tests, MiniPay provider simulation, signature compatibility tests, and a production Next.js build.

## Game distribution

| Catch | XP | Probability |
| --- | --- | --- |
| Tiny Fish | 10 | 45.00% |
| Blue Fish | 25 | 25.00% |
| Puffer Fish | 75 | 15.00% |
| Golden Fish | 150 | 9.00% |
| Shark | 350 | 4.50% |
| Whale Catch | 1000 | 1.00% |
| Empty Hook | 0 | 0.50% |

## License

MIT
