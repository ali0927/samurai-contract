const csv = require("csv-parser");
const fs = require("fs");
const web3 = require("Web3");

var whitelistAddresses = [];
var invalidUsers = [];
fs.createReadStream("../results.csv")
  .pipe(csv())
  .on("data", (row) => {
    address = row.address.trim();
    const isAddress = web3.utils.isAddress(address);

    if (!isAddress) {
      if (address.endsWith(".eth")) {
        invalidUsers.push(
          row.username +
            ": " +
            row.address.trim() +
            " reason: Submitted ENS address"
        );
      } else {
        invalidUsers.push(
          row.username +
            ": " +
            row.address.trim() +
            " reason: Not a valid ETH address"
        );
      }
    } else {
      whitelistAddresses.push(row.address);
      console.log(row);
    }
  })
  .on("end", () => {
    fs.writeFile(
      "../data/whitelistAddresses.json",
      JSON.stringify(whitelistAddresses),
      function (err) {
        if (err) {
          console.log("shit");
        }
      }
    );
    console.log("CSV file successfully processed");
    console.log(invalidUsers);
  });
