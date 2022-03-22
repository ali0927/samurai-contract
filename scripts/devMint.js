require("dotenv").config();

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);
  const mintAmount = 20;

  const initialTotalSupply = await shogunNFT.totalSupply();
  const initialDevBalance = await shogunNFT.balanceOf(
    "0xB4f2257696F31c1646940E7256BD6716Ec5B5C02"
  );
  console.log("Initial balance in dev wallet:", parseInt(initialDevBalance));
  console.log("Initial Total Supply of NFTs:", parseInt(initialTotalSupply));
  await shogunNFT.devMint(mintAmount);

  console.log("Successfully minted NFTs for dev account: ", mintAmount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
