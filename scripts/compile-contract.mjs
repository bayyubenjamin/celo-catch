import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import solc from "solc";

const contractFiles = ["CeloCatchCore.sol", "CeloCatchNFT.sol", "CeloCatchToken.sol", "FishingRod.sol"];
const sources = {};

for (const file of contractFiles) {
  const contractPath = path.join(process.cwd(), "contracts", file);
  if (fs.existsSync(contractPath)) {
    sources[file] = { content: fs.readFileSync(contractPath, "utf8") };
  } else {
    console.error(`Error: File ${file} tidak ditemukan.`);
    process.exit(1);
  }
}

const input = {
  language: "Solidity",
  sources: sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin/")) {
    // MOCK DIPERBAIKI: Constructor sekarang menerima argumen agar sesuai dengan kode Anda
    if (importPath.includes("Ownable.sol")) {
      return { contents: "abstract contract Ownable { constructor(address initialOwner) {} function owner() public view virtual returns (address) { return msg.sender; } modifier onlyOwner() { _; } }" };
    }
    if (importPath.includes("ERC20.sol")) {
      return { contents: "contract ERC20 { constructor(string memory name, string memory symbol) {} function decimals() public view virtual returns (uint8) { return 18; } function _mint(address, uint256) internal virtual {} }" };
    }
    if (importPath.includes("ERC1155.sol")) {
      return { contents: "contract ERC1155 { constructor(string memory uri) {} function balanceOf(address, uint256) public view virtual returns (uint256) { return 10; } function _mint(address, uint256, uint256, bytes memory) internal virtual {} function _burn(address, uint256, uint256) internal virtual {} }" };
    }
  }
  return { error: `File tidak ditemukan: ${importPath}` };
}

console.log("Memulai kompilasi dengan mock constructor berparameter...");
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

const errors = (output.errors ?? []).filter((item) => item.severity === "error");
if (errors.length > 0) {
  for (const error of errors) console.error(error.formattedMessage);
  process.exit(1);
}

console.log("✨ Kompilasi kontrak sukses!");
