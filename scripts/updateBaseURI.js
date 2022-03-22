require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  const initialBaseURI = await shogunNFT.baseURI();
  const newBaseURI =
    "ipfs://bafybeib5evtne7labyfarmvbsok3n2sgcgttdu45upvzd6tfu257wlpr7y/"; // to replace with new baseURI REMEMBER /

  console.log("Initial Base URI: ", initialBaseURI);
  console.log("Updating base URI with dev account");
  await shogunNFT.setBaseURI(newBaseURI);

  console.log("Successfully updated Base URI:", newBaseURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
