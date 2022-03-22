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
  let { deployer, treasury } = await getNamedAccounts();
  const [owner, vault] = await ethers.getSigners();

  let chainId = await getChainId();

  // Initialize parameters for contract constructor

  // Workaround since ShogunNFT was not deployed using hardhat-deploy
  let shogunNFTAddress =
    chainId === 1
      ? process.env.CONTRACT_ADDRESS
      : (await deployments.get("ShogunNFT")).address;

  treasury = chainId === 1 || chainId === 4 ? treasury : vault.address;

  console.log("Deploying Sacrifice...");

  // DEPLOY UninterestedUnicorns
  const sacrifice = await deploy("Sacrifice", {
    from: deployer,
    args: [shogunNFTAddress, treasury],
  });

  gasLogger.addDeployment(sacrifice);
};

module.exports.tags = ["Sacrifice", "All"];
