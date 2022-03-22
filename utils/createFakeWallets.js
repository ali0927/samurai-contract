var ethers = require("ethers");
var crypto = require("crypto");
var numFakeAddresses = 1200;
var addressToWhitelist = [];
console.log("Generating fake whitelist addresses");
for (let i = 0; i < numFakeAddresses; i++) {
  var id = crypto.randomBytes(32).toString("hex");
  var privateKey = "0x" + id;

  var wallet = new ethers.Wallet(privateKey);
  console.log("Address: " + wallet.address);
  addressToWhitelist.push(wallet.address);
}
console.log("Completed generating ", numFakeAddresses, " whitelist addresses");
console.log("Dumping list to whitelistAddresses.json");

var json = JSON.stringify(addressToWhitelist);
var fs = require("fs");
fs.writeFile("../data/whitelistAddresses.json", json, function (err) {
  if (err) throw err;
  console.log("complete");
});
