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

  // Config
  console.log(`Deploying MockSho... from ${deployer}`);

  // string memory _name,
  // string memory _symbol,
  // string memory _notRevealedUri,
  // address _owner,
  // address _treasury

  let mockSHO = await deploy("MockSho", {
    from: deployer,
    args: [],
  });

  gasLogger.addDeployment(mockSHO);
};

module.exports.tags = ["ShoToken"];
