const guildMapping = require("../data/guildMapping.json");
const fs = require("fs");

async function main() {
  let map = {
    Justice: "01",
    Courage: "02",
    Compassion: "03",
    Respect: "04",
    Integrity: "05",
    Honor: "06",
    Duty: "07",
    Restraint: "08",
  };

  let bytes = "0x";

  for (key of Object.keys(guildMapping)) {
    console.log(guildMapping[key]);
    bytes += map[guildMapping[key]];
  }

  let data = JSON.stringify([bytes], null, 2);
  fs.writeFileSync(`guildMapping-bytes.json`, data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
