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

  familyCount = await ShogunStaking.getFamilyCount();
  console.log(familyCount.toString());

  // Generate Array of numbers from 1 to TOTAL IMAGES
  const indexes = Array.from(
    { length: parseInt(familyCount) },
    (_, i) => i + 1
  );

  let chunks = chunkArray(indexes, 100);

  let list = [];

  for (chunk of chunks) {
    // Use All Settled to pin multiple files at a time
    const datas = await Promise.allSettled(
      chunk.map((x) => ShogunStaking.getFamilyStatus(x))
    );
    console.log("🚀 | main | datas", datas);

    // Update old metadata from data/json and output in data/metadata
    for (let i = 0; i < chunk.length; i++) {
      if (datas[i].value.toString() == "0") {
        list.push(chunk[i]);
      }
    }
    console.log("🚀 | main | list", list);

    sleep(1000);
  }

  // for (let i = 1; i <= parseInt(familyCount); i++) {
  //   let status = await ShogunStaking.getFamilyStatus(i);
  //   console.log(status.toString());
  //   if (status.toString() == "0") {
  //     list.push([i]);
  //   }
  // }

  // convert JSON object to string
  const data = JSON.stringify(list);

  // write JSON string to a file
  fs.writeFileSync("unstake.json", data, (err) => {
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
