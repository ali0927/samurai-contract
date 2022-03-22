// Only works for deployment to local blockchain
require("dotenv").config();
const addressesToAirdrop = require("../data/giveawayAddresses.json");
console.log(addressesToAirdrop);

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  console.log("airdropping NFTs through smart contract...");

  txn = await shogunNFT.airdrop(addressesToAirdrop);
  console.log(txn);
  console.log("Airdrop for giveaways completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
