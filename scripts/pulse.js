// Only works for deployment to local blockchain
require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const paused = await shogunNFT.paused();
  console.log("paused value is", paused);

  const isPresaleOpen = await shogunNFT.isPresaleOpen();
  console.log("Is presale open? ", isPresaleOpen);

  const isPublicSaleOpen = await shogunNFT.isPublicSaleOpen();
  console.log("Is public sale open? ", isPublicSaleOpen);

  const baseURI = await shogunNFT.baseURI();
  console.log("BaseURI value is", baseURI);

  const notRevealedUri = await shogunNFT.notRevealedUri();
  console.log("notReavealedURI value is", notRevealedUri);

  const mintedCount = await shogunNFT.totalSupply();
  console.log("current minted count is", parseInt(mintedCount));

  const devWallet = await shogunNFT.balanceOf(
    "0x8D32DB8010a9495a53abA404c632e9c761295497"
  );
  console.log("devWallet supply is", parseInt(devWallet));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
