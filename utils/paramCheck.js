require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const treasury = await shogunNFT.treasury();
  console.log("Treasury wallet address value is", treasury);
  const baseURI = await shogunNFT.baseURI();
  console.log("BaseURI value is", baseURI);
  const notRevealedUri = await shogunNFT.notRevealedUri();
  console.log("notReavealedURI value is", notRevealedUri);
  const mintCost = await shogunNFT.cost();
  console.log("mintCost value is", parseInt(mintCost));
  const maxSupply = await shogunNFT.maxSupply();
  console.log("maxSupply value is", parseInt(maxSupply));
  const maxMintPerTxn = await shogunNFT.maxMintPerTxn();
  console.log("Maximum mint per transaction is", parseInt(maxMintPerTxn));
  const nftPerAddressLimitPublic = await shogunNFT.nftPerAddressLimitPublic();
  console.log(
    "Maximum mint per wallet during public launch is ",
    parseInt(nftPerAddressLimitPublic)
  );
  const nftPerAddressLimitPresale = await shogunNFT.nftPerAddressLimitPresale();
  console.log(
    "Maximum mint per wallet during presale is ",
    parseInt(nftPerAddressLimitPresale)
  );
  const presaleWindow = await shogunNFT.presaleWindow();
  console.log("presaleWindow value is", parseInt(presaleWindow));
  const paused = await shogunNFT.paused();
  console.log("paused value is", paused);

  const isPresaleOpen = await shogunNFT.isPresaleOpen();
  console.log("Is presale open? ", isPresaleOpen);

  const isPublicSaleOpen = await shogunNFT.isPublicSaleOpen();
  console.log("Is public sale open? ", isPublicSaleOpen);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
