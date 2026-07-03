import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import solc from "solc";

const contractPath = path.join(process.cwd(), "contracts", "CeloCatch.sol");
const source = fs.readFileSync(contractPath, "utf8");
const input = {
  language: "Solidity",
  sources: { "CeloCatch.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((item) => item.severity === "error");
if (errors.length > 0) {
  for (const error of errors) console.error(error.formattedMessage);
  process.exit(1);
}

const compiled = output.contracts?.["CeloCatch.sol"]?.CeloCatch;
if (!compiled?.evm?.bytecode?.object) {
  console.error("CeloCatch bytecode was not produced.");
  process.exit(1);
}

console.log(`CeloCatch compiled successfully (${compiled.evm.bytecode.object.length / 2} bytes).`);
