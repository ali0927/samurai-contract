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

  let unstakeList = require("./unstakeList.json");

  // await (await ShogunStaking.connect(owner).setUnstaker(owner.address)).wait();

  // familyCount = await ShogunStaking.connect(owner).estimateGas.getFamilyCount();
  // console.log(familyCount.toString());

  unstakeListChunks = chunkArray(unstakeList, 100);

  let shogunsToUnstake = [];
  let userRewards = [];
  let users = [];
  // Loop Through Unstake List
  for (chunk of unstakeListChunks) {
    const datas = await Promise.allSettled(
      chunk.map((x) => ShogunStaking.getShogunsOfFamily(x))
    );

    for (let data of datas) {
      data.value.map((x) => shogunsToUnstake.push(x.toString()));
    }
    console.log("🚀 | main | shogunsToUnstake", shogunsToUnstake);

    const rewardsDatas = await Promise.allSettled(
      chunk.map((x) => ShogunStaking.calculateRewards(x))
    );
    console.log("🚀 | main | rewardsDatas", rewardsDatas);

    for (let data of rewardsDatas) {
      userRewards.push(data.value.toString());
    }

    const ownersDatas = await Promise.allSettled(
      chunk.map((x) => ShogunStaking.getOwnerOfFamily(x))
    );

    for (let data of ownersDatas) {
      users.push(data.value.toString());
    }
  }

  // convert JSON object to string
  let data = JSON.stringify(userRewards);

  // write JSON string to a file
  fs.writeFileSync("userRewards.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });

  // convert JSON object to string
  data = JSON.stringify(users);

  // write JSON string to a file
  fs.writeFileSync("users.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });

  // convert JSON object to string
  data = JSON.stringify(shogunsToUnstake);

  // write JSON string to a file
  fs.writeFileSync("shogunsToUnstake.json", data, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
