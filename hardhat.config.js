/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

require("hardhat-deploy");

const { time } = require("@openzeppelin/test-helpers");

task("increase-time", "Skips the local blockchain by X days")
  .addParam("d", "Days")
  .setAction(async (taskArgs, hre) => {
    const days = taskArgs.d;

    console.log(await time.latest());
    await time.increase(time.duration.days(days));
    console.log(await time.latest());
  });

module.exports = {
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      saveDeployments: true,
      // gasPrice: 100000000000,
      // blockGasLimit: 30000000000,

      // maxFeePerGas: 50000000000,
      // maxPriorityFeePerGas: 2000000000,
    },
    hardhat: {
      // forking: {
      //   url: "https://eth-mainnet.alchemyapi.io/v2/nqH9gioOwy1vC4f9L5TPTQ35fAMkJZu2",
      //   blockNumber: 13464956, // to replace with pause block number
      // },
      mining: {
        auto: true,
        interval: 0,
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/1BZVhZYC_ZUdMreXD9KaWl4HlwNDvemO`,
      chainId: 1,
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com`,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      80001: "0x0902CB364E49101F4ab5D4fFDE5035973e728D3F"
    },
    treasury: {
      default: 0,
      1: "0x9115eD5a96E881F12868E83d0C5A18444E22c063",
      4: "0x9115eD5a96E881F12868E83d0C5A18444E22c063",
    },
  },
};
