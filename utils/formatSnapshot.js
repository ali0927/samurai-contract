const snapshot = require("../data/SMsnapshot.json");

var addresses = [];
var quantities = [];
for (var key in snapshot) {
  addresses.push(key);
  quantities.push(snapshot[key]);
}

var fs = require("fs");
var addressesSM = JSON.stringify(addresses);

fs.writeFile("../data/addressesSM.json", addressesSM, function (err) {
  if (err) throw err;
  console.log("complete formatting addresses");
});

var fs = require("fs");
var quantitiesSM = JSON.stringify(quantities);
fs.writeFileSync("../data/quantitiesSM.json", quantitiesSM, function (err) {
  if (err) throw err;
  console.log("complete formatting quantities");
});
