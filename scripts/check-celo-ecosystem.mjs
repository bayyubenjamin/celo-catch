import fs from "node:fs";
import process from "node:process";

// 1. Membaca file konfigurasi
const project = JSON.parse(fs.readFileSync("project.json", "utf8"));
const networkSource = fs.readFileSync("lib/celo-networks.ts", "utf8");
const configSource = fs.readFileSync("lib/config.ts", "utf8");
const minipaySource = fs.readFileSync("lib/ethereum.ts", "utf8");

// 2. Membaca sumber kontrak modular (menggunakan CeloCatchCore sebagai entry point utama)
const coreContractSource = fs.readFileSync("contracts/CeloCatchCore.sol", "utf8");

// 3. Menambahkan pengecekan modular yang lebih teliti
const checks = [
  [project.project.primaryEcosystem === "celo", "Primary ecosystem is Celo"],
  [project.project.multiChain === false, "Project is Celo-specific"],
  [project.ecosystem.mainnet.chainId === 42220, "Celo Mainnet chain ID is declared"],
  [project.ecosystem.testnet.chainId === 11142220, "Celo Sepolia chain ID is declared"],
  [networkSource.includes("eip155:42220"), "Celo Mainnet CAIP-2 identity exists"],
  [networkSource.includes("eip155:11142220"), "Celo Sepolia CAIP-2 identity exists"],
  [configSource.includes("resolveCeloChain"), "Runtime resolves a Celo chain"],
  [minipaySource.includes("isMiniPay"), "MiniPay provider integration exists"],
  
  // Memastikan kontrak modular Anda terdeteksi
  [coreContractSource.includes("contract CeloCatchCore"), "CeloCatchCore contract source exists"],
  [fs.existsSync("contracts/CeloCatchNFT.sol"), "CeloCatchNFT module exists"],
  [fs.existsSync("contracts/CeloCatchToken.sol"), "CeloCatchToken module exists"],
  [fs.existsSync("contracts/FishingRod.sol"), "FishingRod module exists"],
];

let failed = false;
console.log("--- Menjalankan Verifikasi Ekosistem Celo ---");

for (const [passed, label] of checks) {
  console.log(`${passed ? "✅ PASS" : "❌ FAIL"}  ${label}`);
  failed ||= !passed;
}

if (failed) {
  console.log("\n❌ Verifikasi Ekosistem Gagal. Silakan periksa file project.json atau konfigurasi lib/.");
  process.exit(1);
}

console.log("\n✨ Celo ecosystem checks passed.");
