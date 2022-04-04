const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { Time } = require("../utils/helper");
const { expect } = require("chai");

require("dotenv").config();

describe("ShogunStakingPolygon", function () {
  before(async function () {
    const { deployer } = await getNamedAccounts();
    [owner, alice] = await ethers.getSigners();
    this.owner = owner;
    this.alice = alice;
    await deployments.fixture(["ShogunStakingPolygon", "ShoToken"]);

    this.shoToken = await ethers.getContract("MockSho", this.owner);
    this.shogunStakingPolygon = await ethers.getContract("ShogunStakingPolygon", this.owner);

    await this.shoToken.mint(this.shogunStakingPolygon.address, ethers.utils.parseEther("100"));
    await this.shogunStakingPolygon.setSHOToken(this.shoToken.address);
  });

  it("Calculate Rewards", async function () {
    await network.provider.send("evm_increaseTime", [Time.hours(36)]);
    await network.provider.send("evm_mine");

    let rewards = await this.shogunStakingPolygon.calculateRewards([0]);
    expect(ethers.utils.formatEther(rewards)).to.eq('1.5');

    await network.provider.send("evm_increaseTime", [Time.hours(36)]);
    await network.provider.send("evm_mine");

    rewards = await this.shogunStakingPolygon.calculateRewards([0, 1]);
    expect(ethers.utils.formatEther(rewards)).to.eq('6.0');
  });

  it("emit correct event on Claim Rewards", async function () {
    await expect(this.shogunStakingPolygon.connect(this.alice).claimRewards([0, 1]))
      .to.emit(this.shogunStakingPolygon, "SubmitRequest");
  });

  it("Should not claim if not owner", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    const requestId = ethers.utils.solidityKeccak256(["string", "uint256[]", "uint256"], [this.alice.address, [0, 1], 1]);
    await expect(this.shogunStakingPolygon.connect(this.alice).confirmRequest(requestId))
      .to.reverted;
  });

  it("Confirm Request", async function() {
    let tx = await this.shogunStakingPolygon.claimRewards([0, 1]);
    let rc = await tx.wait();
    const rewards = await this.shogunStakingPolygon.calculateRewards([0, 1]);
    const submitRequestEvent = rc.events.find(e => e.event === 'SubmitRequest');
    const requestId = submitRequestEvent.args.requestId;
    tx = await this.shogunStakingPolygon.confirmRequest(requestId);
    rc = await tx.wait();
    const balance = await this.shoToken.balanceOf(this.owner.address);
    expect(balance).to.eq(rewards);
  });

});