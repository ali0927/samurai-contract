require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const publicSaleOpen = await shogunNFT.publicSaleOpen();

  console.log("ispublicSaleOpen?: ", publicSaleOpen);
  await shogunNFT.setPublicSaleOpen(true);
  console.log(await shogunNFT.publicSaleOpen());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
