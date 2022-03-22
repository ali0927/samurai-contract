// Only works for deployment to local blockchain
require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Chunk Array
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

async function main() {
  let [owner] = await ethers.getSigners();
  let abi = require("./ShogunStakingV2.json");
  const ShogunStaking = new ethers.Contract(
    "0xC4F4811A854b60f7b35c8e46c4f2Ebfdd035bEd1",
    abi,
    owner
  );

  let unstakeList = require("./shogunsToUnstake.json");
  let uniqueUsers = require("./uniqueUsers.json");
  let userRewardsUnique = require("./userRewardsUnique.json");

  // await (await ShogunStaking.connect(owner).setUnstaker(owner.address)).wait();

  // familyCount = await ShogunStaking.connect(owner).estimateGas.getFamilyCount();
  // console.log(familyCount.toString());

  unstakeListChunks = chunkArray(unstakeList, 2000);

  let shogunsToUnstake = [];
  let userRewards = [];
  let users = [];
  // Loop Through Unstake List
  // for (chunk of unstakeListChunks) {
  //   let tx = await ShogunStaking.estimateGas.unlockShogunNFTs(chunk);
  //   console.log("🚀 | main | tx", tx.toString());
  // }

  // let tx = await ShogunStaking.unlockShogunNFTs(unstakeList);
  // await tx.wait();

  // console.log("🚀 | main | tx", tx.toString());

  // 1.8 ETH

  // uniqueUsersChunks = chunkArray(uniqueUsers, 2000);
  // userRewardsUniqueChunks = chunkArray(userRewardsUnique, 2000);

  // Loop Through Unstake List
  tx = await ShogunStaking.airdrop(uniqueUsers, userRewardsUnique);
  await tx.wait();

  // console.log("🚀 | main | tx", tx.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
