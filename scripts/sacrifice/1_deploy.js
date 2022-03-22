async function main() {
  const [deployer, vault] = await ethers.getSigners();

  // Initialize parameters for contract constructor
  const shogunNFTAddress = process.env.CONTRACT_ADDRESS;

  // Start deployment of NFT Smart Contract
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Vault will be:", vault.address);
  const Sacrifice = await ethers.getContractFactory("Sacrifice");
  console.log("Deploying Contract...");
  const sacrifice = await Sacrifice.deploy(shogunNFTAddress, vault.address);
  await sacrifice.deployed();
  console.log("Contract deployed to:", sacrifice.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
