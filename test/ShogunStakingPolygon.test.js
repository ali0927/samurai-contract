const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
// const { time } = require("./utils");

require("dotenv").config();

describe("ShogunStakingPolygon", function () {
  let owner, treasury, alice, bob;
  let shoToken;
  let shogunStakingPolygon;

  before(async function () {
    [owner, alice] = await ethers.getSigners();

    await deployments.fixture(["ShogunStakingPolygon", "ShoToken"]);

    // shoToken = await ethers.getContract("MockSho", owner);
    // shogunStakingPolygon = await ethers.getContract("ShogunStakingPolygon", owner);
    shogunStakingPolygon = await deployments.get('ShogunStakingPolygon');
  });

  it("Calculate and Claim Rewards", async function () {
    
  });

});
