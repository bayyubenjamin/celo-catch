# 🎣 Celo Catch

![Celo Ecosystem](https://img.shields.io/badge/ecosystem-Celo-35D07F)
![Celo Mainnet](https://img.shields.io/badge/Celo%20Mainnet-42220-476520)
![MiniPay](https://img.shields.io/badge/wallet-MiniPay-5A31F4)
![Version](https://img.shields.io/badge/version-1.2.0-1F2937)
![Status](https://img.shields.io/badge/status-Mainnet%20Live-success)

**Celo Catch is a Celo-native, MiniPay-first consumer application.** Built exclusively for the Celo Mainnet, it transforms a simple daily fishing game loop into a lightweight, frictionless on-chain experience. Players can open the app, receive one daily catch, earn XP, and build a verifiable public participation history.

> **Current release: Version 1.2.0 — Mainnet Live**
>
> Celo Catch is actively deployed on the Celo Mainnet. The application operates on a highly modular smart contract architecture, native MiniPay wallet integration, and server-signed payload verifications to ensure maximum security and efficiency.

---

## ✨ Key Features & Product Principles

Celo Catch is designed around four core principles to onboard the next billion users:

1. **📱 Mobile & MiniPay First:** The primary environment is Opera MiniPay, not a traditional desktop wallet dashboard. The UI seamlessly adapts to inject the wallet without requiring users to manually "Connect".
2. **⛽ Fee Abstraction (Zero CELO Required):** Users do not need native CELO to play. Gas fees are abstracted and paid directly using the **USDm** stablecoin, removing the biggest friction point in Web3 onboarding.
3. **🛡️ Verifiable Gameplay:** Valid catches are recorded and independently verified on the Celo Mainnet.
4. **🌐 Celo Native:** Network configuration, wallet behavior, contract flow, and testing are specifically optimized for the Celo ecosystem (utilizing Viem over standard ethers.js).

---

## 🏗️ Modular Smart Contract Architecture

To ensure optimal security, upgradability, and a strict separation of concerns, the ecosystem is powered by four specialized smart contracts located in the `contracts/` directory:

* **`CeloCatchCore.sol` (The Hub):** The primary orchestrator. It verifies server-signed payloads, enforces the "one-cast-per-day" rule, manages the core user state, and securely bridges cross-contract communications.
* **`CeloCatchToken.sol` (The Economy):** The native utility token governing the economic layer. It handles reward distribution, in-game currency balances, and user-driven economic activities.
* **`CeloCatchNFT.sol` (The Assets):** The Non-Fungible Token (NFT) contract representing true ownership of unique digital assets (e.g., rare catches, badges), ensuring the provenance of all minted items.
* **`FishingRod.sol` (The Utility):** A specialized mechanics contract governing the player's primary tool. It manages attributes, levels, durability, and computational logic.

---

## 🔒 Security Model

### Deterministic Daily Result
A wallet receives the exact same fish and nonce for a specific UTC day. Repeated requests cannot be used to reroll the API until a rare fish appears. The result is securely derived from:
* Celo Chain ID
* `CeloCatchCore` contract address
* Player's wallet address
* Current UTC day
* Private server randomness secret

### Signed Payload Validation
Each catch signature securely binds the following data to prevent tampering:
* Core contract address & Celo chain ID
* Player address, Fish type, and XP amount
* Nonce & UTC day
* Expiration deadline

### Contract Enforcement
The `CeloCatchCore.sol` strictly enforces:
* One cast per wallet per UTC day.
* Fish-to-XP validation.
* Signature expiration and nonce replay protection.
* Server signer verification (low-`s` ECDSA validation) with owner-controlled signer rotation.

---

## 📊 Game Distribution

| Catch | XP | Probability |
| :--- | :--- | :--- |
| Tiny Fish | 10 | 45.00% |
| Blue Fish | 25 | 25.00% |
| Puffer Fish | 75 | 15.00% |
| Golden Fish | 150 | 9.00% |
| Shark | 350 | 4.50% |
| Whale Catch | 1000 | 1.00% |
| Empty Hook | 0 | 0.50% |

---

## ⚙️ Technical Evidence & Ecosystem Identity

| Classification | Value |
| :--- | :--- |
| **Primary Ecosystem** | Celo |
| **Production Network** | Celo Mainnet (`42220`) |
| **CAIP-2 Namespace** | `eip155:42220` |
| **Primary Wallet Runtime** | MiniPay |
| **Transaction Library** | Viem |

**Repository Structure:**
* `app/` — Next.js routes, metadata, and API endpoints.
* `components/` — MiniPay-first application interface.
* `lib/ethereum.ts` — MiniPay injected-provider handling.
* `scripts/` & `tests/` — Automated test suites and MiniPay verification scripts.

---

## 🚀 Local Development & Testing

### Installation

**Requirements:** Node.js 20.9+ and npm.

```bash
git clone [https://github.com/bayyubenjamin/celo-catch.git](https://github.com/bayyubenjamin/celo-catch.git)
cd celo-catch
npm install
cp .env.example .env.local
npm run dev

```

Open `http://localhost:3000` to view the application.

### Environment Configuration

To connect to the Celo Mainnet, configure your `.env` file:

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

*> ⚠️ **Warning:** Never expose server secrets using the `NEXT_PUBLIC_` prefix.*

### Running Verifications

Run the complete verification pipeline to perform strict TypeScript checking, deterministic catch tests, MiniPay provider simulation, and signature compatibility tests:

```bash
npm run verify

```

---

## 📱 Testing in MiniPay (Developer Mode)

To experience the native MiniPay auto-connect and USDm fee abstraction on an Android device:

1. Open **Opera Mini** > **MiniPay** tab.
2. Navigate to **Settings** > **About**.
3. Tap **Version Number** 10 times to unlock **Developer Settings**.
4. Go back to Settings > **Developer Settings** and paste your deployed DApp URL (or local ngrok tunnel).
5. Interact with the application to see gas fees abstracted seamlessly.

---

## License

This project is licensed under the MIT License.
