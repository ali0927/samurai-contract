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
  let shogunNFTAddress =
    chainId === 1
      ? process.env.CONTRACT_ADDRESS
      : (await deployments.get("ShogunNFT")).address;

  console.log(`Deploying ShogunStaking... from ${deployer}`);

  // string memory _name,
  // string memory _symbol,
  // string memory _notRevealedUri,
  // address _owner,
  // address _treasury

  let shogunStaking = await deploy("ShogunStaking", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OptimizedTransparentProxy",
      execute: {
        init: {
          methodName: "__ShogunStaking_init",
          args: [shogunNFTAddress, ethers.utils.parseEther("1.0"), deployer],
        },
        // onUpgrade: {
        //   methodName: "__UniQuest_upgrade",
        //   args: [2],
        // },
      },
    },
  });

  gasLogger.addProxyDeployment(shogunStaking);
  const guildList = require("../data/guildMapping-bytes.json");
  const byteGuild = guildList[0];
  shogunStaking = await ethers.getContract("ShogunStaking", owner);
  tx = await (
    await shogunStaking.connect(owner).updateGuilds(byteGuild)
  ).wait();

  gasLogger.addTransaction(tx);
};

module.exports.tags = ["ShogunStaking"];
