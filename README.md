# Celo Catch

Celo Catch is a MiniPay-first daily fishing game on Celo. Players open the app, receive one catch for the current UTC day, confirm the onchain action, earn XP, and appear on an event-based leaderboard.

The experience is deliberately small and friendly: no token promise, no DeFi dashboard, and no unnecessary wallet ceremony.

## Status

- MiniPay-first mobile frontend
- Automatic injected-wallet connection
- Celo Sepolia as the default test network
- Solidity contract included and compile-tested
- Contract not deployed yet
- Mainnet not configured yet

Without a configured contract address, the application stays in preview mode and does not allow live casts.

## MiniPay readiness

The frontend detects MiniPay through the injected provider, obtains the existing account automatically, avoids showing a connect button, and uses Viem for contract writes. MiniPay network mismatches are handled with instructions for its **Use Testnet** setting instead of forcing a chain switch.

The interface is single-column, safe-area aware, responsive from 320px, and uses touch targets suitable for an in-app mobile browser.

## Security model

The catch service creates a deterministic result for each wallet and UTC day. Repeating the API request on the same day therefore returns the same fish and nonce instead of allowing users to reroll until a rare result appears.

The signed result is bound to the contract, chain, player, fish, XP, nonce, day, and deadline. The contract verifies the signature, enforces one cast per day, validates XP, rejects expired results, and prevents nonce reuse.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Viem
- Solidity
- Vitest
- GitHub Actions

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. An injected wallet is detected automatically.

## Verification

```bash
npm run verify
```

This runs:

- strict TypeScript checks;
- deterministic catch tests;
- simulated MiniPay provider tests;
- Solidity compilation;
- MiniPay readiness checks;
- a production Next.js build.

The same verification runs in GitHub Actions.

## Deploy the contract

The contract is located at `contracts/CeloCatch.sol`.

1. Create a dedicated server-signing wallet.
2. Deploy `CeloCatch` with its public address as `initialServerSigner`.
3. Record the deployment block.
4. Configure the web app using `.env.example`.
5. Confirm the deployed `serverSigner()` value matches the signing wallet.
6. Redeploy the web application.

Start on Celo Sepolia. Move to Celo Mainnet only after the in-app MiniPay flow has passed end-to-end testing.

## Test inside MiniPay

1. Deploy the application to an HTTPS URL.
2. Enable Developer Mode from MiniPay's About screen.
3. Open Developer Settings and enable **Use Testnet**.
4. Use **Load Test Page** to open the deployed URL.
5. Confirm that the wallet appears automatically without a connect button or signature prompt.
6. Confirm that the app reports Celo Sepolia.
7. Cast once and approve the transaction.
8. Verify the `FishCaught` event in the explorer.
9. Reload the app and confirm that today's cast is marked as used.
10. Repeat the cast API request and confirm the fish and nonce do not change for that wallet and day.

## Architecture notes

- Public RPC endpoints are suitable for testing; use dedicated infrastructure as traffic grows.
- The current leaderboard aggregates contract events in the browser.
- A larger season should use backend indexing.
- Contract state and signature verification are the source of truth.

## Game values

| Catch | XP | Probability |
|---|---:|---:|
| Tiny Fish | 10 | 45.00% |
| Blue Fish | 25 | 25.00% |
| Puffer Fish | 75 | 15.00% |
| Golden Fish | 150 | 9.00% |
| Shark | 350 | 4.50% |
| Whale Catch | 1000 | 1.00% |
| Empty Hook | 0 | 0.50% |

## License

MIT
