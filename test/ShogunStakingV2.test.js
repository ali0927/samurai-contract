const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { time, expectRevert } = require("@openzeppelin/test-helpers");

const { GasLogger } = require("../utils/helper");

require("dotenv").config();

let gasLogger = new GasLogger();

describe.only("ShogunStaking", function () {
  let owner, treasury, alice, bob;
  let shogunSamurais;
  let shoToken;
  let shogunStaking;

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns

    [owner, alice] = await ethers.getSigners();

    await deployments.fixture(["ShogunNFT", "ShoToken", "ShogunStakingV2"]);
    shogunSamurais = await ethers.getContract("ShogunNFT", owner);
    shoToken = await ethers.getContract("MockSho", owner);
    shogunStaking = await ethers.getContract("ShogunStakingV2", owner);

    // dev mint to owner
    await (await shogunSamurais.connect(owner).devMint(3)).wait();
    expect(await shogunSamurais.balanceOf(owner.address)).to.eq(3);
  });

  it("Calculate and Claim Rewards", async function () {
    // await network.provider.send("evm_increaseTime", [8640000]);
    // await time.increaseTo(1645883200);
    tx = await (await shogunStaking.connect(owner).claimRewardsV2(1)).wait();
    // console.log("🚀 | tx", tx);

    console.log(
      ethers.utils.formatEther(await shoToken.balanceOf(owner.address))
    );
  });

  it("Should not claim if not owner", async function () {
    // await network.provider.send("evm_increaseTime", [8640000]);
    // await time.increaseTo(1645883200);
    tx = await (
      await shogunSamurais
        .connect(owner)
        .transferFrom(owner.address, alice.address, 2)
    ).wait();
    // tx = await (await shogunStaking.connect(owner).claimRewardsV2(1)).wait();
    await expectRevert(
      shogunStaking.claimRewardsV2(2),
      "ShogunStaking: Claimant is not the owner!"
    );
    // console.log("🚀 | tx", tx);

    console.log(
      ethers.utils.formatEther(await shoToken.balanceOf(owner.address))
    );
  });

  it("Should not claim if not owner", async function () {
    // await network.provider.send("evm_increaseTime", [8640000]);
    // await time.increaseTo(1645883200);
    // tx = await (
    //   await shogunSamurais
    //     .connect(owner)
    //     .transferFrom(owner.address, alice.address, 2)
    // ).wait();
    // tx = await (await shogunStaking.connect(owner).claimRewardsV2(1)).wait();
    await (await shogunStaking.claimRewardsMultiV2()).wait();
    // console.log("🚀 | tx", tx);

    console.log(
      ethers.utils.formatEther(await shoToken.balanceOf(owner.address))
    );
  });
});
