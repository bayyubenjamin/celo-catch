# Changelog

All notable changes to Celo Catch are documented in this file.

The project follows Semantic Versioning. A release number describes the maturity of the software package, not the existence of a deployed smart contract. Deployment status is documented separately for each release.

## [1.0.0] — MiniPay Foundation

### Release classification

- **Application status:** foundation complete
- **MiniPay status:** native architecture implemented and tested through provider simulation
- **Contract status:** implemented and compile-tested
- **Deployment status:** not deployed
- **Live transaction status:** disabled by default

### Added

- MiniPay-aware injected provider detection.
- Automatic wallet account discovery without a generic connect-wallet screen.
- Viem-based wallet and contract transaction architecture.
- Celo Sepolia development configuration.
- Professional mobile-first interface with safe-area support.
- Preview mode for installations without a deployed contract.
- Deterministic wallet-per-day catch generation.
- Server-signed catch payloads.
- Smart contract enforcement for daily eligibility, XP validation, signature deadlines, and nonce replay protection.
- Event-based leaderboard reader.
- Strict TypeScript configuration.
- Automated catch, wallet-provider, and signature tests.
- Solidity compilation verification.
- MiniPay readiness verification script.
- Production Next.js build validation.
- GitHub Actions verification workflow.

### Changed

- Replaced the previous Ethers.js transaction path with Viem.
- Replaced the previous Alfajores test configuration with Celo Sepolia.
- Reworked the interface from a generic Web3 dashboard into a friendly mobile game experience.
- Replaced random API reroll behavior with deterministic daily results.
- Split the original monolithic application page into focused wallet, Celo, contract, and gameplay modules.

### Security

- Bound signatures to the contract address, chain ID, player, fish type, XP, nonce, UTC day, and deadline.
- Added nonce reuse prevention.
- Added one-cast-per-wallet-per-day enforcement.
- Added fish-to-XP validation.
- Added low-`s` ECDSA signature validation.
- Added owner-controlled server signer rotation.

### Not included in this release

- Celo Sepolia contract deployment.
- Public testnet contract address.
- End-to-end transaction confirmation from a physical MiniPay installation.
- Celo Mainnet deployment.
- Production RPC, monitoring, and indexing infrastructure.

## [1.1.0] — Celo Sepolia Activation

Planned.

Expected scope:

- deploy the Version 1 contract to Celo Sepolia;
- publish deployment address and block;
- configure server signing infrastructure;
- complete real MiniPay testnet transactions;
- verify emitted events and daily eligibility;
- enable live testnet casting.

## [1.2.0] — Mainnet Readiness

Planned after Version 1.1 acceptance.

Expected scope:

- security review and operational hardening;
- production RPC and monitoring;
- production key-management process;
- Celo Mainnet deployment;
- public production activation.
