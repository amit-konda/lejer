const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LedgerboundBook contract...");

  // Get the contract factory
  const LedgerboundBook = await ethers.getContractFactory("LedgerboundBook");

  // For MVP, we'll use the deployer as the marketplace address
  // In production, this would be a separate marketplace contract
  const [deployer] = await ethers.getSigners();
  const marketplaceAddress = deployer.address;

  console.log("Deploying with the account:", deployer.address);
  console.log("Marketplace address:", marketplaceAddress);

  // Deploy the contract
  const ledgerboundBook = await LedgerboundBook.deploy(
    "Ledgerbound Books",
    "LBOOK",
    marketplaceAddress
  );

  await ledgerboundBook.waitForDeployment();

  const contractAddress = await ledgerboundBook.getAddress();
  console.log("LedgerboundBook deployed to:", contractAddress);

  // Set default royalty (5% to deployer)
  const royaltyReceiver = deployer.address;
  const feeNumerator = 500; // 5%
  
  await ledgerboundBook.setDefaultRoyalty(royaltyReceiver, feeNumerator);
  console.log("Default royalty set to 5% for address:", royaltyReceiver);

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