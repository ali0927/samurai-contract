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
  const { deployer, adminAddress, collectionOwner, treasuryAddress } =
    await getNamedAccounts();
  const [owner] = await ethers.getSigners();
  const chainId = await getChainId();

  // Config

  // Workaround since ShogunNFT was not deployed using hardhat-deploy

  console.log(`Deploying ShogunStaking... from ${deployer}`);

  let shogunStaking = await deploy("ShogunStakingV2", {
    from: deployer,
    args: [],
  });

  gasLogger.addDeployment(shogunStaking);
};

module.exports.tags = ["ShogunStakingV2Imp"];
