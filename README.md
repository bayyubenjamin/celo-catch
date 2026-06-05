# 🎣 Celo Catch

**Celo Catch** is a **MiniPay-native casual fishing game** built on the **Celo blockchain**.

Users connect their wallet, cast once per day, catch random fish, earn XP, and climb the Genesis leaderboard. Every catch is recorded onchain through a Celo smart contract, creating transparent proof of participation.

The goal is simple: make onchain activity feel like a fun mobile game, not a complicated crypto transaction.

---

## 🌍 Built for the Celo Ecosystem

Celo Catch is designed for:

- **Celo Mainnet**
- **MiniPay users**
- **Mobile-first Web3 onboarding**
- **Emerging-market communities**
- **Lightweight onchain participation**
- **Casual consumer crypto apps**

Celo Catch turns daily gameplay into verifiable onchain activity.

---

## 📱 MiniPay-Native Experience

Celo Catch is designed to work as a simple mobile-first dApp experience for MiniPay-style users.

The app focuses on:

- Simple wallet connection
- Small mobile screen layout
- Low-friction daily gameplay
- Lightweight Celo transactions
- Clear user feedback after every cast
- Onchain proof of participation

---

## ✨ Core Features

- 🎣 Daily fishing cast
- 🐟 Random fish rarity
- ⭐ XP scoring system
- 🏆 Genesis leaderboard
- 🔐 Server-signed catch result
- ⛓️ Onchain catch record
- 📱 Mobile-first UI
- 🌍 Celo Mainnet support
- 🧾 Transparent event-based activity tracking

---

## 🎮 Game Loop

1. User opens Celo Catch on mobile
2. User connects wallet
3. User taps **Cast Line**
4. Backend generates a signed random fish result
5. User confirms the Celo transaction
6. Smart contract verifies the signature
7. Catch is recorded onchain
8. XP updates the Genesis leaderboard

---

## 🐠 Fish Rarity

| Fish | XP |
|---|---:|
| Tiny Fish | 10 XP |
| Blue Fish | 25 XP |
| Puffer Fish | 75 XP |
| Golden Fish | 150 XP |
| Shark | 350 XP |
| Whale Catch | 1000 XP |
| Empty Hook | 0 XP |

---

## 🧠 Why Celo Catch?

Most onchain apps feel like finance tools.

Celo Catch makes onchain activity feel like a daily mobile game.

Instead of asking users to understand complex Web3 flows, the app gives them a familiar loop:

> Cast daily → catch fish → earn XP → climb leaderboard → build onchain proof.

This makes Celo Catch useful for:

- User onboarding
- Daily retention
- Community campaigns
- Onchain engagement
- MiniPay consumer experiments
- Lightweight proof-of-participation

---

## 🔐 Smart Contract

The Celo Catch smart contract verifies signed catch results and records valid catches onchain.

### Core Function

```solidity
function recordCatch(
    uint8 fishType,
    uint256 xp,
    uint256 nonce,
    uint256 deadline,
    bytes calldata signature
) external;

Event
event FishCaught(
    address indexed player,
    uint8 fishType,
    uint256 xp,
    uint256 day,
    uint256 nonce,
    uint256 timestamp
);

The frontend reads FishCaught events to build the leaderboard.

⛓️ Network
Celo Mainnet
Field	Value
Network	Celo Mainnet
Chain ID	42220
Currency	CELO
RPC	https://forno.celo.org
Explorer	https://celoscan.io
Alfajores Testnet
Field	Value
Network	Celo Alfajores
Chain ID	44787
Currency	CELO
RPC	https://alfajores-forno.celo-testnet.org
Explorer	https://alfajores.celoscan.io
📍 Deployment
Smart Contract
Network	Contract
Celo Mainnet	PASTE_MAINNET_CONTRACT_ADDRESS_HERE
Alfajores	PASTE_ALFAJORES_CONTRACT_ADDRESS_HERE
Live App
PASTE_VERCEL_OR_DOMAIN_URL_HERE
🧰 Tech Stack
Next.js
TypeScript
Tailwind CSS
Ethers.js
Solidity
Remix IDE
Celo Mainnet
MiniPay/mobile-first wallet flow
⚙️ Environment Variables

Create .env.local:

SERVER_SIGNER_PRIVATE_KEY=0xYOUR_SERVER_SIGNER_PRIVATE_KEY

NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CELO_CONTRACT_ADDRESS
NEXT_PUBLIC_START_BLOCK=0

For Alfajores:

NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_RPC_URL=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_ALFAJORES_CONTRACT_ADDRESS
🚀 Run Locally
npm install
npm run dev

Open:

http://localhost:3000
🧪 Smart Contract Deployment

The smart contract can be deployed using Remix.

Open Remix
Create CeloCatch.sol
Compile with Solidity 0.8.24
Connect wallet to Celo Mainnet or Alfajores
Deploy with serverSigner address
Copy the deployed contract address
Add it to .env.local
📊 Onchain Activity Model

Celo Catch creates simple onchain activity through daily gameplay.

Each valid cast emits a FishCaught event containing:

Player wallet
Fish type
XP
Day
Nonce
Timestamp

This makes gameplay transparent, verifiable, and easy to index.

🏆 Genesis Season

Celo Catch starts with a Genesis Season.

Early users can:

Cast daily
Collect fish
Earn XP
Climb the leaderboard
Build public onchain participation history

No token. No promise. Every catch is recorded onchain.

🗺️ Roadmap
Phase 1 — MVP
 Mobile-first UI
 Wallet connection
 Daily cast
 Signed random catch result
 Onchain catch record
 Leaderboard from events
Phase 2 — MiniPay Polish
 MiniPay-specific UX improvements
 Share catch result
 Better mobile animations
 Public player profile
 Genesis badge design
Phase 3 — Game Expansion
 Treasure chest
 Frenzy mode
 Weekly leaderboard
 Referral crew system
 Seasonal snapshots
🧩 Repository Topics

Recommended GitHub topics:

celo
minipay
celo-blockchain
celo-dapp
mobile-first
onchain-game
web3-game
nextjs
typescript
solidity
ethers
remix
consumer-crypto
📌 Project Positioning

Celo Catch is not a DeFi app.

It is a consumer crypto mini game designed to create fun, repeatable, mobile-first onchain activity on Celo.

The project explores how simple games can onboard users into Web3 through familiar daily habits instead of complex financial products.

License

MIT
