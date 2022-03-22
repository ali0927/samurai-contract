// Only works for deployment to local blockchain
require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const revealed = await shogunNFT.revealed();

  console.log("NFT revealed?: ", revealed);
  console.log("Turning on reveal NFT");
  await shogunNFT.reveal();

  console.log(
    "Successfully revealed NFT, OpenSea will take a while to update metadata"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
