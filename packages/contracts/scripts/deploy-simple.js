const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LedgerboundBookSimple contract...");

  // Get the contract factory
  const LedgerboundBookSimple = await ethers.getContractFactory("LedgerboundBookSimple");

  // For MVP, we'll use the deployer as the marketplace address
  const [deployer] = await ethers.getSigners();
  const marketplaceAddress = deployer.address;

  console.log("Deploying with the account:", deployer.address);
  console.log("Marketplace address:", marketplaceAddress);

  // Deploy the contract
  const ledgerboundBook = await LedgerboundBookSimple.deploy(
    "Ledgerbound Books",
    "LBOOK",
    marketplaceAddress
  );

  await ledgerboundBook.waitForDeployment();

  const contractAddress = await ledgerboundBook.getAddress();
  console.log("LedgerboundBookSimple deployed to:", contractAddress);

  console.log("Deployment completed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Owner:", await ledgerboundBook.owner());
  console.log("Marketplace:", await ledgerboundBook.marketplaceAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 