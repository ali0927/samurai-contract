// Only works for deployment to local blockchain
require("dotenv").config();
const addressesToWhitelist = require("../data/whitelistAddresses.json");
console.log(addressesToWhitelist);

async function main() {
  const [deployer] = await ethers.getSigners(); // gets the private account
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);

  function chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index + chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
    }

    return tempArray;
  }
  chunkedArrays = chunkArray(addressesToWhitelist, 500);

  console.log("Updating whitelist through smart contract...");

  for (arrays of chunkedArrays) {
    console.log(arrays.length);
    txn = await (await shogunNFT.whitelistUsers(arrays)).wait();
    console.log(txn);
  }

  console.log("Whitelisted users successfully updated!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
