import hre from "hardhat";

async function main() {
  console.log("Mulai deploy ke Celo Mainnet...\n");

  // 1. Deploy FishingRod
  const FishingRod = await hre.ethers.deployContract("FishingRod");
  await FishingRod.waitForDeployment();
  const rodAddress = await FishingRod.getAddress();
  console.log(`1. FishingRod deployed ke: ${rodAddress}`);

  // 2. Deploy CeloCatchCore(ROD_ADDR)
  const CeloCatchCore = await hre.ethers.deployContract("CeloCatchCore", [rodAddress]);
  await CeloCatchCore.waitForDeployment();
  const coreAddress = await CeloCatchCore.getAddress();
  console.log(`2. CeloCatchCore deployed ke: ${coreAddress}`);

  // 3. Deploy CeloCatchNFT(CORE_ADDR)
  const CeloCatchNFT = await hre.ethers.deployContract("CeloCatchNFT", [coreAddress]);
  await CeloCatchNFT.waitForDeployment();
  const nftAddress = await CeloCatchNFT.getAddress();
  console.log(`3. CeloCatchNFT deployed ke: ${nftAddress}`);

  // 4. Deploy CeloCatchToken(NFT_ADDR)
  const CeloCatchToken = await hre.ethers.deployContract("CeloCatchToken", [nftAddress]);
  await CeloCatchToken.waitForDeployment();
  const tokenAddress = await CeloCatchToken.getAddress();
  console.log(`4. CeloCatchToken deployed ke: ${tokenAddress}`);

  console.log("\nDeployment Selesai! Simpan address di atas untuk verifikasi.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
