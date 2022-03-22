require("dotenv").config();
const fs = require("fs");
async function main() {
  const accounts = await ethers.provider.listAccounts();
  const address = process.env.CONTRACT_ADDRESS;
  const ShogunNFT = await ethers.getContractFactory("ShogunNFT");
  const shogunNFT = await ShogunNFT.attach(address);
  var holders = {};
  var totalSupply = BigInt(await shogunNFT.totalSupply());

  for (i = 4445; i <= 7245; i++) {
    console.log("token ", i, "/", totalSupply);
    walletOfToken = await shogunNFT.ownerOf(i);

    if (holders[walletOfToken] == undefined) {
      holders[walletOfToken] = 1;
    } else {
      holders[walletOfToken] = holders[walletOfToken] + 1;
    }
    console.log("wallet of token id", i, ": ", walletOfToken);
  }

  console.log(holders);

  // write to output
  var holdersString = JSON.stringify(holders);
  // console.log(json);

  fs.writeFileSync("snaphotCC.json", holdersString, function (err) {
    if (err) throw err;
    console.log("complete");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
