# Celo Catch

![Celo Ecosystem](https://img.shields.io/badge/ecosystem-Celo-35D07F)
![Celo Mainnet](https://img.shields.io/badge/Celo%20Mainnet-42220-476520)
![Celo Sepolia](https://img.shields.io/badge/Celo%20Sepolia-11142220-476520)
![MiniPay](https://img.shields.io/badge/wallet-MiniPay-5A31F4)
![Version](https://img.shields.io/badge/version-1.0.0-1F2937)

**Celo Catch is a Celo-native, MiniPay-first consumer application.** It is a daily onchain fishing game designed specifically for Celo Mainnet and Celo Sepolia. The repository is not a generic multi-chain template.

The product turns a simple mobile game loop into a lightweight onchain experience: open the app, receive one daily catch, earn XP, and build a public participation history.

> **Current release: Version 1.0.0 — MiniPay Foundation**
>
> Version 1 delivers the complete Celo application foundation, MiniPay-native wallet flow, contract source, security model, automated tests, and production-ready interface. The smart contracts are intentionally **not deployed in Version 1**. Celo Sepolia deployment and live transaction activation are planned for Version 1.1.

## Celo ecosystem identity

| Classification | Value |
|---|---|
| Primary ecosystem | **Celo** |
| Blockchain namespace | `eip155` |
| Production network | Celo Mainnet |
| Mainnet chain ID | `42220` |
| Mainnet CAIP-2 | `eip155:42220` |
| Development network | Celo Sepolia |
| Testnet chain ID | `11142220` |
| Testnet CAIP-2 | `eip155:11142220` |
| Primary wallet runtime | MiniPay |
| Transaction library | Viem |
| Smart contract language | Solidity |
| Multi-chain project | **No** |
| Contract deployment | Planned for Version 1.1 |

### Machine-readable project metadata

Repository indexers and automated classifiers can read the same classification from:

- [`project.json`](project.json) — project, ecosystem, integration, and evidence manifest;
- [`celo.json`](celo.json) — Celo release and network metadata;
- [`.github/PROJECT_METADATA.yml`](.github/PROJECT_METADATA.yml) — repository-level classification;
- [`docs/CELO_ECOSYSTEM.md`](docs/CELO_ECOSYSTEM.md) — human-readable ecosystem evidence map.

### Technical evidence

| Celo evidence | Source |
|---|---|
| Celo Mainnet and Celo Sepolia identity | [`lib/celo-networks.ts`](lib/celo-networks.ts) |
| Runtime Celo chain selection | [`lib/config.ts`](lib/config.ts) |
| MiniPay injected-provider integration | [`lib/ethereum.ts`](lib/ethereum.ts) |
| Celo RPC reads and event queries | [`lib/celo.ts`](lib/celo.ts) |
| Celo modular smart contract sources | [`contracts/`](contracts/) (Core, NFT, Token, FishingRod) |
| Celo chain identity tests | [`tests/celo-ecosystem.test.ts`](tests/celo-ecosystem.test.ts) |
| MiniPay provider simulation | [`tests/ethereum.test.ts`](tests/ethereum.test.ts) |
| Signature compatibility verification | [`tests/signature.test.ts`](tests/signature.test.ts) |
| Full CI verification | [`.github/workflows/verify.yml`](.github/workflows/verify.yml) |

## Release status

| Area | Version 1 status |
|---|---|
| Celo-specific application architecture | Ready |
| MiniPay wallet integration | Ready and automated |
| Mobile UI/UX | Ready |
| Daily catch engine | Ready |
| Server-signed catch flow | Ready |
| Solidity contracts | Implemented and compile-tested |
| Automated verification | Passing |
| Celo Sepolia contracts | Not deployed in Version 1 |
| Live MiniPay transaction | Planned for Version 1.1 |
| Celo Mainnet launch | Planned after testnet validation |

Version 1 runs safely in **preview mode** when no contract address is configured. The interface can be reviewed and tested without presenting inactive blockchain functionality as live.

## Version 1 scope

### Included

- Celo Mainnet and Celo Sepolia network definitions
- MiniPay-aware injected wallet detection
- Automatic account connection without a generic wallet-connect screen
- Viem-based transaction architecture
- Celo Sepolia as the default development network
- Mobile-first interface designed for the MiniPay in-app browser
- Deterministic daily catch generation
- Server-signed catch payloads
- Replay-resistant nonce design
- One-cast-per-day contract logic
- Event-based leaderboard architecture
- Strict TypeScript validation
- Celo network identity tests
- MiniPay wallet-provider tests
- Solidity compilation checks
- Production Next.js build verification
- GitHub Actions verification workflow

### Intentionally deferred

The following items are not part of Version 1.0.0:

- deployment of `CeloCatchCore`, `CeloCatchToken`, `CeloCatchNFT`, and `FishingRod` contracts;
- public Celo Sepolia contract addresses;
- live MiniPay transaction confirmation;
- explorer-verified `FishCaught` events;
- production RPC infrastructure;
- Celo Mainnet deployment.

These items are release work, not missing application architecture. They are scheduled for the next version after the Version 1 foundation is reviewed and accepted.

## Product principles

Celo Catch is designed around four principles:

1. **Celo native** — network configuration, wallet behavior, contract flow, and testing are designed for Celo.
2. **Mobile first** — the primary environment is MiniPay, not a desktop wallet dashboard.
3. **Low friction** — users should not need to understand bridges, gas markets, or DeFi terminology.
4. **Verifiable gameplay** — valid catches can be recorded and independently verified on Celo.

Version 1 contains no token launch, guaranteed reward, or financial return claim.

## How the game works

When blockchain activation is enabled in Version 1.1, the intended flow is:

1. The player opens Celo Catch inside MiniPay.
2. The injected MiniPay account is detected automatically.
3. The application verifies the configured Celo network.
4. The server generates the player's deterministic catch for the current UTC day.
5. The server signs a payload bound to the Core Celo contract, chain, player, fish, XP, nonce, day, and deadline.
6. The player confirms the transaction in MiniPay.
7. The contract verifies the signature and daily eligibility.
8. The catch is emitted through `FishCaught` and added to the leaderboard history.

In Version 1.0.0, the application stops before the live transaction stage unless a valid Celo deployment configuration is supplied.

## MiniPay-native architecture

The frontend uses MiniPay's injected EIP-1193 provider through `window.ethereum`.

The application:

- detects the MiniPay environment using `isMiniPay`;
- requests the already-injected account automatically;
- avoids displaying an unnecessary **Connect Wallet** button inside MiniPay;
- uses Viem for wallet clients and contract writes;
- does not force MiniPay to switch networks;
- provides clear instructions when MiniPay testnet settings do not match Celo Sepolia;
- reacts to account and network changes;
- supports safe-area insets and small mobile viewports;
- provides explicit loading, error, empty, preview, and transaction states.

## Celo network architecture

`lib/celo-networks.ts` is the canonical application-level declaration of ecosystem identity.

The application supports:

```text
Celo Mainnet   eip155:42220
Celo Sepolia   eip155:11142220

```

An unrelated EVM chain is not treated as a supported production target. Development falls back to Celo Sepolia rather than a generic Ethereum network.

## Security model

### Deterministic daily result

A wallet receives the same fish and nonce for the same UTC day. Repeated requests cannot be used to reroll the API until a rare fish appears.

The result is derived from:

* Celo chain ID;
* Core Celo contract address;
* player address;
* UTC day;
* private server randomness secret.

### Signed payload

Each catch signature binds:

* Core contract address;
* Celo chain ID;
* player address;
* fish type;
* XP amount;
* nonce;
* UTC day;
* expiration deadline.

### Contract enforcement

`contracts/CeloCatchCore.sol` enforces:

* one cast per wallet per UTC day;
* fish-to-XP validation;
* signature expiration;
* nonce replay protection;
* server signer verification;
* low-`s` ECDSA validation;
* owner-controlled signer rotation.

## Technology

* Celo Mainnet and Celo Sepolia
* MiniPay
* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Viem
* Solidity
* Vitest
* GitHub Actions

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
tests/                         Celo, provider, catch, and signature tests
project.json                   Machine-readable project manifest
celo.json                      Celo-specific release metadata
docs/CELO_ECOSYSTEM.md         Celo evidence and classification map
docs/ROADMAP.md                Release sequence and acceptance criteria
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

Without a contract address, the application displays Version 1 preview mode. This is the expected state for the current release.

## Environment configuration

```dotenv
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_RPC_URL=[https://forno.celo-sepolia.celo-testnet.org](https://forno.celo-sepolia.celo-testnet.org)
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_START_BLOCK=0
SERVER_SIGNER_PRIVATE_KEY=
SERVER_RANDOMNESS_SECRET=

```

For Version 1.0.0, contract and signer values may remain empty.

For Version 1.1.0, the Celo contract addresses, deployment blocks, signer key, and randomness secret must be configured before live testing.

Never expose server secrets using the `NEXT_PUBLIC_` prefix.

## Verification

Run the complete verification pipeline:

```bash
npm run verify

```

The command performs:

* strict TypeScript checking;
* deterministic catch tests;
* Celo ecosystem identity tests;
* MiniPay provider simulation;
* server-signature compatibility tests;
* Solidity contract compilation;
* MiniPay readiness checks;
* production Next.js build.

GitHub Actions executes the same pipeline for branch updates and pull requests.

## Version plan

### Version 1.0.0 — MiniPay Foundation

Current release.

* Celo-specific application architecture;
* professional mobile UI/UX;
* MiniPay-native wallet behavior;
* security and modular contracts implementation;
* automated verification;
* preview-mode operation.

### Version 1.1.0 — Celo Sepolia Activation

Next release.

* deploy modular contracts (Core, Token, NFT, FishingRod) to Celo Sepolia;
* configure server signer and deployment environment;
* test a real transaction from MiniPay Developer Mode;
* verify `FishCaught` events in the Celo Sepolia explorer;
* validate one-cast-per-day behavior end to end;
* publish the testnet contract addresses and deployment blocks.

### Version 1.2.0 — Celo Mainnet Readiness

Planned after testnet acceptance.

* complete security review;
* configure production Celo RPC and monitoring;
* finalize operational key management;
* deploy to Celo Mainnet;
* activate production gameplay.

See [`docs/ROADMAP.md`](https://www.google.com/search?q=docs/ROADMAP.md) for release acceptance criteria.

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
