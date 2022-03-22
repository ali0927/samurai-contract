require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const presaleOpen = await shogunNFT.presaleOpen();

  console.log("isPresaleOpen?: ", presaleOpen);
  console.log("Turning on Presale for whitelisted members");
  await shogunNFT.setPresaleOpen(true);

  console.log(
    "Successfully set presale open, whitelisted members can now mint up to 2 max"
  );
  console.log(await shogunNFT.presaleOpen());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
