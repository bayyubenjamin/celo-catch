import fs from "node:fs";
import process from "node:process";

const project = JSON.parse(fs.readFileSync("project.json", "utf8"));
const networkSource = fs.readFileSync("lib/celo-networks.ts", "utf8");
const configSource = fs.readFileSync("lib/config.ts", "utf8");
const minipaySource = fs.readFileSync("lib/ethereum.ts", "utf8");
const contractSource = fs.readFileSync("contracts/CeloCatch.sol", "utf8");

const checks = [
  [project.project.primaryEcosystem === "celo", "Primary ecosystem is Celo"],
  [project.project.multiChain === false, "Project is Celo-specific"],
  [project.ecosystem.mainnet.chainId === 42220, "Celo Mainnet chain ID is declared"],
  [project.ecosystem.testnet.chainId === 11142220, "Celo Sepolia chain ID is declared"],
  [networkSource.includes("eip155:42220"), "Celo Mainnet CAIP-2 identity exists"],
  [networkSource.includes("eip155:11142220"), "Celo Sepolia CAIP-2 identity exists"],
  [configSource.includes("resolveCeloChain"), "Runtime resolves a Celo chain"],
  [minipaySource.includes("isMiniPay"), "MiniPay provider integration exists"],
  [contractSource.includes("contract CeloCatch"), "Celo Catch contract source exists"],
];

let failed = false;
for (const [passed, label] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${label}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
console.log("Celo ecosystem checks passed.");
