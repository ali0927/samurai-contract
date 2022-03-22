const axios = require("axios");

async function main() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // replace the hash with the one found on opensea
  for (let i = 6041; i <= 7014; i++) {
    console.log(i);
    await axios
      .get(
        `https://api.opensea.io/asset/0x8399D6351FD0ddb33f77BFc627E3264D74500d22/${i}/?force_update=true`
      )
      .then((response) => {
        console.log(response.data);
        console.log(response.data.image_original_url);
        console.log(response.data.token_metadata);
      })
      .catch((error) => {
        console.log("error");
      });
  }
}
main();
