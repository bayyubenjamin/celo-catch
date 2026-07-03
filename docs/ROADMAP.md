# Celo Catch Release Roadmap

This document defines the release sequence for Celo Catch and prevents application readiness from being confused with blockchain deployment status.

## Release policy

Each version must have a clearly documented scope, acceptance criteria, and deployment state.

A release is not described as live merely because the application builds successfully or the contract compiles. Live status requires a deployed contract, configured environment, successful MiniPay transaction, and verifiable explorer evidence.

## Version 1.0.0 — MiniPay Foundation

### Objective

Deliver a stable, professionally documented application foundation that is ready for a later Celo contract deployment.

### Included deliverables

- MiniPay-aware wallet provider integration
- automatic account connection
- Viem transaction architecture
- mobile-first user interface
- preview-mode behavior
- deterministic daily catch engine
- signed catch API
- compile-tested Solidity contract
- event-based leaderboard architecture
- automated test and build pipeline
- environment template
- release documentation

### Explicit exclusions

- deployed Celo Sepolia contract
- deployed Celo Mainnet contract
- live gameplay transaction
- production RPC and monitoring
- public contract address

### Acceptance criteria

Version 1.0.0 is accepted when:

- TypeScript strict checks pass;
- all automated tests pass;
- the Solidity contract compiles;
- MiniPay readiness checks pass;
- the production Next.js build succeeds;
- the application opens safely without blockchain configuration;
- inactive blockchain actions are not presented as live;
- release scope and deferred deployment are documented clearly.

### Completion state

**Foundation complete. Deployment deferred by design.**

## Version 1.1.0 — Celo Sepolia Activation

### Objective

Activate the Version 1 application on Celo Sepolia and verify the complete MiniPay transaction path.

### Planned work

1. Create a dedicated server signer.
2. Deploy `contracts/CeloCatch.sol` to Celo Sepolia.
3. Record the deployment transaction and block number.
4. Configure the contract address and start block.
5. Configure the server signer private key.
6. Configure a production-quality randomness secret.
7. Deploy the web application to HTTPS.
8. Open the application through MiniPay Developer Mode.
9. Complete a real testnet cast.
10. Verify the `FishCaught` event in the explorer.
11. Confirm the wallet cannot cast twice during the same UTC day.
12. Confirm repeated API requests return the same daily fish and nonce.
13. Publish the testnet deployment information.

### Acceptance criteria

Version 1.1.0 is accepted only when:

- the deployed bytecode matches the reviewed contract source;
- `serverSigner()` matches the configured signing wallet;
- a real MiniPay transaction succeeds on Celo Sepolia;
- the transaction receipt is successful;
- the expected `FishCaught` event is visible in the explorer;
- XP and cast totals update correctly;
- daily eligibility remains correct after reload;
- error and rejection states are tested on a physical MiniPay installation;
- deployment details are added to the README and release notes.

### Required release evidence

- contract address
- deployment block
- deployment transaction hash
- explorer link
- successful MiniPay transaction hash
- verification checklist result

## Version 1.2.0 — Mainnet Readiness

### Objective

Prepare and activate the tested Celo Catch system on Celo Mainnet.

### Planned work

- complete contract security review;
- define owner and signer key-management procedures;
- configure production RPC infrastructure;
- configure uptime and transaction monitoring;
- determine event indexing strategy;
- validate production environment separation;
- deploy the reviewed contract to Celo Mainnet;
- perform controlled production smoke testing;
- publish mainnet deployment information.

### Acceptance criteria

- all Version 1.1 criteria remain satisfied;
- no unresolved high-severity security issue remains;
- production keys are separated from development keys;
- production monitoring is active;
- the contract is verified on the selected explorer;
- a controlled MiniPay mainnet transaction succeeds;
- rollback and signer-rotation procedures are documented.

## Future releases

Later releases may add:

- indexed leaderboard infrastructure;
- player profiles;
- seasonal snapshots;
- achievements and collectible records;
- social sharing;
- localization;
- improved accessibility;
- operational analytics.

These features must not weaken the Version 1 security guarantees or introduce speculative reward claims without a separate product and legal review.
