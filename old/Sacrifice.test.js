const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");

const { GasLogger } = require("../utils/helper");

// const clanList = require("../data/mock-clans.json"); // To add Clan List
const { BigNumber } = require("@ethersproject/bignumber");

require("dotenv").config();

function unpack(str) {
  const buffer = 2; // account for 0x
  const l = [];
  for (var i = 1 + buffer; i <= str.length; i = i + 2) {
    l.push(parseInt(str[i]));
  }
  return l;
}

let gasLogger = new GasLogger();

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    let shogunNFT, sacrifice;

    // Get Signers
    [owner, vault, alice] = await ethers.getSigners();

    let { treasury } = await getNamedAccounts();

    await deployments.fixture(["ShogunNFT", "Sacrifice"]);

    // Get SS Contract
    shogunNFT = await ethers.getContract("ShogunNFT", owner);

    // Get Sacrifice Contract
    sacrifice = await ethers.getContract("Sacrifice", owner);

    await shogunNFT.connect(owner).setApprovalForAll(sacrifice.address, true);
    await shogunNFT.connect(vault).setApprovalForAll(sacrifice.address, true);
    await shogunNFT.connect(alice).setApprovalForAll(sacrifice.address, true);

    console.log("fixture");

    return [shogunNFT, sacrifice, owner, vault, alice, treasury];
  }
);

describe("Sacrifice contract", async () => {
  let shogunNFT, sacrifice, owner, vault, alice, vaultAddress;

  before(async function () {
    // Get Fixture of Training and Shogun Samurais
    [shogunNFT, sacrifice, owner, vault, alice, vaultAddress] =
      await setupTest();

    console.log("Pre-test complete");
  });

  async function setupMint(revealedCount, vaultCount) {
    await shogunNFT.connect(owner).devMint(revealedCount);
    await sacrifice.connect(owner).setPaused(false);
    await sacrifice.connect(owner).setRevealedCount(revealedCount);
    await shogunNFT.connect(owner).transferOwnership(vault.address);
    await shogunNFT.connect(vault).devMint(vaultCount);
    await shogunNFT.connect(vault).transferOwnership(await owner.getAddress());
    await shogunNFT
      .connect(owner)
      .airdrop(Array.from({ length: revealedCount }).map((_) => alice.address));
  }

  describe("Deployment", () => {
    it("should set the right owner", async () => {
      expect(await sacrifice.owner()).to.equal(owner.address);
    });

    it("should initialize the right parameters", async () => {
      expect(await sacrifice.paused()).to.equal(true);
      expect(await sacrifice.shogunNFT()).to.equal(shogunNFT.address);
      expect(await sacrifice.vault()).to.equal(vault.address);
    });
  });

  describe("Sacrifice", () => {
    beforeEach(async () => {
      // Get Fixture of Training and Shogun Samurais
      [shogunNFT, sacrifice, owner, vault, alice, vaultAddress] =
        await setupTest();
    });
    it("should be able to sacrifice", async () => {
      await setupMint(1, 1);

      const beforeSupply = await shogunNFT.totalSupply();
      // sacrifice
      await sacrifice.connect(alice).sacrifice(1);
      // burnt
      await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
      const afterSupply = await shogunNFT.totalSupply();
      expect(beforeSupply - 1).to.be.equal(afterSupply);
    });

    it("should be pausable", async () => {
      await setupMint(2, 1);
      // sacrifice
      await sacrifice.connect(alice).sacrifice(1);
      await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
      // pause contract
      await sacrifice.connect(owner).setPaused(true);
      await expect(sacrifice.connect(alice).sacrifice(2)).to.be.revertedWith(
        "SHOGUN: Contract is paused"
      );
      // not burnt
      expect(await shogunNFT.ownerOf(2)).to.be.equal(alice.address);
    });

    it("should not be able to sacrifice unrevealed samurai", async () => {
      await setupMint(1, 3);

      // sacrifice
      await sacrifice.connect(alice).sacrifice(1);
      await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
      // cannot burn unrevealed
      await expect(sacrifice.connect(alice).sacrifice(2)).to.be.revertedWith(
        "SHOGUN: cannot sacrifice unrevealed samurai"
      );
    });

    it("should not be able to sacrifice when supply is exhausted", async () => {
      await setupMint(3, 1);
      // sacrifice
      await sacrifice.connect(alice).sacrifice(1);
      await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
      // cannot sacrifice when there are no more samurais left
      await expect(sacrifice.connect(alice).sacrifice(2)).to.be.revertedWith(
        "SHOGUN: no more samurais available"
      );
      expect(await shogunNFT.ownerOf(2)).to.be.equal(alice.address);
    });
  });
});
