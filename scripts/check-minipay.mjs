import fs from "node:fs";
import process from "node:process";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const walletSource = fs.readFileSync("lib/ethereum.ts", "utf8");
const appSource = fs.readFileSync("components/celo-catch-app.tsx", "utf8");
const configSource = fs.readFileSync("lib/config.ts", "utf8");

const checks = [
  [!packageJson.dependencies.ethers, "Ethers.js is not used for MiniPay transactions"],
  [Boolean(packageJson.dependencies.viem), "Viem is installed"],
  [walletSource.includes("isMiniPay"), "MiniPay provider detection exists"],
  [walletSource.includes("eth_requestAccounts"), "Injected account auto-connect exists"],
  [appSource.includes("createWalletClient"), "Transactions use a Viem wallet client"],
  [!appSource.includes("Connect Wallet"), "MiniPay UI does not show a connect button"],
  [configSource.includes("celoSepolia"), "Celo Sepolia is the default test network"],
];

let failed = false;
for (const [passed, label] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
console.log("MiniPay readiness checks passed.");
