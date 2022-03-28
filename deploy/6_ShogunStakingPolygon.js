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
    const { deployer, adminAddress, collectionOwner } = await getNamedAccounts();
    const [owner] = await ethers.getSigners();

    let mockToken = await ethers.getContract("MockSho", deployer);

    console.log(`Deploying ShogunStakingPolygon... from ${deployer}`);

    let shogunStaking = await deploy("ShogunStakingPolygon", {
        from: deployer,
        proxy: {
          owner: deployer,
          proxyContract: "OptimizedTransparentProxy",
          execute: {
            init: {
            methodName: "__ShogunStakingPolygon_init",
            args: [deployer, mockToken.address],
            }
        },
    },
  });

  gasLogger.addProxyDeployment(shogunStaking);

};

module.exports.tags = ["ShogunStakingPolygon"];
