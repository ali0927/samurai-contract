// scripts/deploy.js
// works for deployment to rinkeby
async function main() {
  const [deployer] = await ethers.getSigners();

  // Initialize parameters for contract constructor
  const name = "ShogunSamurais";
  const symbol = "SGS";
  const initBaseUri = "";
  const notrevealedUri =
    "https://gateway.pinata.cloud/ipfs/QmWJeHGBPN6x74svUjzJifHUawNxLM1kBQDecRsBY992rE";
  const signerAddressPresale = "0x2348681242641A26FdEE99633848EA3bf995986A";
  const signerAddressPublic = "0x01Bc98715Ecd2643259A396213d86582Ed7571F5";
  const treasuryAddress = "0x9115eD5a96E881F12868E83d0C5A18444E22c063";

  // Start deployment of NFT Smart Contract
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  console.log("Deploying Contract...");
  const shogunNFT = await ShogunNFT.deploy(
    name,
    symbol,
    initBaseUri,
    notrevealedUri,
    signerAddressPresale,
    signerAddressPublic,
    treasuryAddress
  );
  await shogunNFT.deployed();
  console.log("Contract deployed to:", shogunNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
