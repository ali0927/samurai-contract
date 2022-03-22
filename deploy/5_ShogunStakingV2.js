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

  let shogunStaking = await deploy("ShogunStakingV2", {
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

  let mockToken = await ethers.getContract("MockSho", owner);
  shogunStaking = await ethers.getContract("ShogunStakingV2", owner);
  tx = await (
    await shogunStaking.connect(owner).setSHOToken(mockToken.address)
  ).wait();

  // console.log("Minting 1000000 SHO Tokens to Staking Contract...");
  // await (
  //   await mockToken.mint(
  //     shogunStaking.address,
  //     ethers.utils.parseEther("1000000")
  //   )
  // ).wait();

  // gasLogger.addTransaction(tx);
};

module.exports.tags = ["ShogunStakingV2"];
