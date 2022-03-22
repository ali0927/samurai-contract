const { ethers } = require("hardhat");
const { GasLogger } = require("../utils/helper.js");

require("dotenv").config();

const gasLogger = new GasLogger();

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {
  const { deploy } = deployments;
  const { deployer, treasury } = await getNamedAccounts();

  // Initialize parameters for contract constructor
  const name = "ShogunSamurais";
  const symbol = "SGS";
  const initBaseUri = "";
  const notrevealedUri =
    "https://gateway.pinata.cloud/ipfs/QmWJeHGBPN6x74svUjzJifHUawNxLM1kBQDecRsBY992rE";
  const signerAddressPresale = "0x2348681242641A26FdEE99633848EA3bf995986A";
  const signerAddressPublic = "0x01Bc98715Ecd2643259A396213d86582Ed7571F5";

  console.log("Deploying ShogunNFT...");

  // DEPLOY UninterestedUnicorns
  const shogunNFT = await deploy("ShogunNFT", {
    from: deployer,
    args: [
      name,
      symbol,
      initBaseUri,
      notrevealedUri,
      signerAddressPresale,
      signerAddressPublic,
      treasury,
    ],
  });

  gasLogger.addDeployment(shogunNFT);
};

module.exports.tags = ["ShogunNFT", "All"];
