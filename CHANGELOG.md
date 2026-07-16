# Changelog

All notable changes to Celo Catch are documented in this file.

The project follows Semantic Versioning. A release number describes the maturity of the software package, not the existence of a deployed smart contract. Deployment status is documented separately for each release.

## [1.2.0] — Mainnet Live & Modular Architecture

### Release classification

- **Application status:** production active
- **Contract architecture:** migrated to a modular ecosystem (Core, Token, NFT, FishingRod)
- **Deployment status:** fully deployed to Celo Mainnet
- **Live transaction status:** enabled

### Added

- Production RPC and monitoring configured for Celo Mainnet.
- Modular smart contract environment configurations (`NEXT_PUBLIC_CORE_ADDRESS`, `NEXT_PUBLIC_TOKEN_ADDRESS`, `NEXT_PUBLIC_NFT_ADDRESS`, `NEXT_PUBLIC_ROD_ADDRESS`).

### Changed

- Deprecated the legacy monolithic `CeloCatch.sol` contract.
- Migrated all platform logic to four specialized modular contracts to ensure optimal security, scalability, and strict separation of concerns.
- Updated default network configuration to Celo Mainnet (`42220`) using the Forno RPC.
- Upgraded the verification pipeline to support multi-contract deployments.

### Security

- Completed security review and operational hardening for Mainnet launch.
- Finalized production key-management processes.
- Bound payload signatures securely to the new `CeloCatchCore` orchestrator contract.

## [1.1.0] — Celo Sepolia Activation

### Release classification

- **Application status:** testnet active
- **Deployment status:** deployed to Celo Sepolia

### Changed

- Configured server signing infrastructure for testnet.
- Completed end-to-end MiniPay testnet transactions.
- Verified emitted `FishCaught` events and daily eligibility logic.

## [1.0.0] — MiniPay Foundation

### Release classification

- **Application status:** foundation complete
- **MiniPay status:** native architecture implemented and tested
- **Deployment status:** not deployed (preview mode)

### Added

- MiniPay-aware injected provider detection.
- Automatic wallet account discovery without a generic connect-wallet screen.
- Viem-based wallet and contract transaction architecture.
- Professional mobile-first interface with safe-area support.
- Deterministic wallet-per-day catch generation.
- Server-signed catch payloads.
- Strict TypeScript configuration and automated test coverage.
- GitHub Actions verification workflow.
