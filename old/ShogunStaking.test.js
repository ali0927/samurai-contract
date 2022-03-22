const { expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require("@openzeppelin/test-helpers");
const { hexStripZeros } = require("@ethersproject/bytes");

const { GasLogger } = require("../utils/helper");

// const guildList = require("../data/mock-guildMapping-bytes.json");
const guildList = require("../data/guildMapping-bytes.json");
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

function calculateGuildMultiplier(ids) {
  const countMultipliers = [10000, 10100, 10300];
  const guildMultiplier = 200;
  let guildCounter = [0, 0, 0, 0, 0, 0, 0, 0];
  let maxCount = 0;
  let sameGuild = false;

  for (id of ids) {
    guildCounter[guildList[id - 1] - 1] += 1;
  }
  // console.log("🚀 | calculateClanMultiplier | guildCounter", guildCounter);

  for (let i = 0; i < guildCounter.length; i++) {
    if (guildCounter[i] > maxCount) {
      maxCount = guildCounter[i];
    }
  }

  if (maxCount == 3) {
    sameGuild = true;
  }

  if (sameGuild) {
    return countMultipliers[maxCount - 1] + guildMultiplier;
  } else {
    return countMultipliers[maxCount - 1];
  }
}

async function medallionCount(contract, address) {
  return await contract.medallionCount(address);
}

async function calculateMedallionMultiplier(contract, user) {
  let medallionMultiplier = BN(10);
  return BN(10000)
    .add(medallionMultiplier)
    .mul(await medallionCount(contract, user));
}

async function airdropTokens(amount, contract, address) {
  // Airdrop tokens to bob
  console.log(`Airdropping ${address} ${amount * 100} tokens...`);
  let airdropList = [];
  for (let i = 0; i < 100; i++) {
    airdropList.push(address);
  }

  for (let i = 0; i < amount; i++) {
    await (await contract.devMint(100)).wait();
    tx = await contract.airdrop(airdropList);
  }
}

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    let shogunSamurais, shogunStaking, shoToken;

    // Get Signers
    [owner, alice, bob, cindy] = await ethers.getSigners();

    treasury = owner; // for localhost

    await deployments.fixture(["ShogunNFT", "ShogunStaking", "ShoToken"]);

    // Get SS Contract
    shogunSamurais = await ethers.getContract("ShogunNFT", treasury);

    // Get ShogunStaking Contract
    shogunStaking = await ethers.getContract("ShogunStaking", alice);

    // Get UniCandy Contract
    shoToken = await ethers.getContract("MockSho", alice);

    // Reserve 60 Unicorns
    console.log("Airdropping Alice 100 tokens...");
    // Airdrop tokens to alice
    await airdropTokens(1, shogunSamurais, alice.address);

    // Update Clan Metadata
    console.log("Updating Guild Metadata...");
    const byteGuild = guildList[0];
    guilds = unpack(byteGuild);
    expect(guilds.length).to.equal(8888);
    tx = await (
      await shogunStaking.connect(owner).updateGuilds(byteGuild)
    ).wait();
    gasLogger.addTransaction(tx);

    // Set Shogun Staking on ShogunNFT

    await (
      await shogunSamurais.setStakingContractAddress(shogunStaking.address)
    ).wait();

    return [
      shogunSamurais,
      shogunStaking,
      shoToken,
      owner,
      treasury,
      alice,
      bob,
    ];
  }
);

describe("Questing", function () {
  let owner, treasury, alice, bob;
  let shogunSamurais;
  let shogunStaking;
  let clans;

  const TEST_SET_1 = [1, 4, 8]; // 3 Integrity
  const TEST_SET_2 = [2]; // 1 Courage
  const TEST_SET_3 = [3, 10]; // 2 Restraint
  const TEST_SET_4 = [5, 6, 7]; // 1 Restraint, 1 Duty, 1 Compassion

  const TEST_SETS = [TEST_SET_1, TEST_SET_2, TEST_SET_3, TEST_SET_4];

  const TEST_SETS_ANSWERS_GUILD_MULTIPLIER = [10500, 10000, 10100, 10300];

  before(async function () {
    // Get Fixture of Questing and Uninterested Unicorns
    [shogunSamurais, shogunStaking, shoToken, owner, treasury, alice, bob] =
      await setupTest();

    await (
      await shogunStaking.connect(owner).setMedallionCount([alice.address], [0])
    ).wait();

    console.log("Pre-test complete");
  });

  it("Should successfully send Samurai on training", async function () {
    console.log("Approving all tokens...");
    tx = await (
      await shogunSamurais
        .connect(alice)
        .setApprovalForAll(shogunStaking.address, true)
    ).wait();
    gasLogger.addTransaction(tx);
    // Ger Reward Info

    for (let i = 0; i < TEST_SETS.length; i++) {
      console.log(`----- TEST_SET_${i + 1} -----`);
      console.log(TEST_SETS[i]);
      tx = await (
        await shogunStaking.connect(alice).startTraining(TEST_SETS[i])
      ).wait();
      // gasLogger.addTransaction(tx);

      console.log("Samurais Staked...");

      // Get Training Info
      let {
        familyOwner,
        lastClaim,
        guildMultiplier,
        medallionMultiplier,
        shogunIds,
        trainState,
      } = await shogunStaking.connect(alice).families(i + 1);
      // console.log("🚀 | lastClaim", lastClaim.toString());
      // console.log("🚀 | medallionMultiplier", medallionMultiplier.toString());
      // console.log("🚀 | guildMultiplier", guildMultiplier.toString());

      expect(familyOwner).to.equal(alice.address);
      expect(guildMultiplier).to.equal(TEST_SETS_ANSWERS_GUILD_MULTIPLIER[i]);
      expect(medallionMultiplier).to.equal(0);
      expect(trainState).to.equal(0);

      await network.provider.send("evm_setAutomine", [false]);
      await network.provider.send("evm_increaseTime", [86400]);

      // Claim SHO
      console.log("Claiming SHO...");
      let balanceBefore = await shoToken.balanceOf(alice.address);
      tx = await shogunStaking.connect(alice).claimRewards(i + 1);
      await network.provider.send("evm_mine");
      tx = await tx.wait();
      // gasLogger.addTransaction(tx);
      let balanceAfter = await shoToken.balanceOf(alice.address);
      console.log(
        "Claimed:",
        ethers.utils.formatEther(balanceAfter.sub(balanceBefore)),
        "SHO"
      );
      console.log("Total:", ethers.utils.formatEther(balanceAfter), "SHO");
      await network.provider.send("evm_setAutomine", [true]);

      // Check if avail to claim is 0 after
      expect(await shogunStaking.calculateRewards(i + 1)).to.equal(0);
    }
  });

  // it("Should claim All", async function () {
  //   // Claim SHO
  //   console.log("Claiming All SHO...");
  //   await time.increase(time.duration.days(1));
  //   tx = await shogunStaking.connect(alice).claimAllRewards();
  //   tx = await tx.wait();
  //   gasLogger.addTransaction(tx);
  //   let balance = await shoToken.balanceOf(alice.address);
  //   console.log("Claimed:", ethers.utils.formatEther(balance), "SHO");

  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(1)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(2)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(3)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(4)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(5)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(6)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(7)),
  //     "SHO"
  //   );
  //   console.log(
  //     "Available Rewards:",
  //     ethers.utils.formatEther(await shogunStaking.calculateRewards(8)),
  //     "SHO"
  //   );
  // });

  // it("Should revert if Samurai does not belong to owner", async function () {
  //   await expectRevert(
  //     shogunStaking.connect(bob).startQuest(TEST_SET_9, 0),
  //     "ShogunStaking: One or More Unicorns are not owned by you!"
  //   );
  // });

  // it("Should revert on any transfer when questing", async function () {
  //   await expectRevert(
  //     shogunSamurais
  //       .connect(alice)
  //       .transferFrom(alice.address, treasury.address, 1),
  //     "ERC721: transfer caller is not owner nor approved"
  //   );
  //   await expectRevert(
  //     shogunSamurais
  //       .connect(alice)
  //       ["safeTransferFrom(address,address,uint256,bytes)"](
  //         alice.address,
  //         treasury.address,
  //         1,
  //         "0x00"
  //       ),
  //     "ERC721: transfer caller is not owner nor approved"
  //   );

  //   await expectRevert(
  //     shogunSamurais.connect(alice).sacrifice(1),
  //     "ERC721: transfer caller is not owner nor approved"
  //   );
  // });

  // it("Should revert if try to withdraw before quest end ", async function () {
  //   await expectRevert(
  //     shogunStaking.connect(alice).endQuest(1),
  //     "ShogunStaking: Unicorns are still questing!"
  //   );
  // });

  // it("Should be able to end quest after questing ends", async function () {
  //   console.log("Ending Training...");
  //   await time.increase(time.duration.days(30));
  //   tx = await (await shogunStaking.connect(alice).endQuest(1)).wait();
  //   gasLogger.addTransaction(tx);

  //   for (id of TEST_SET_1) {
  //     expect(await shogunSamurais.ownerOf(id)).to.equal(alice.address);
  //   }
  // });

  // it("Should revert if try to claim after questing ends", async function () {
  //   await expectRevert(
  //     shogunStaking.connect(alice).claimRewards(1),
  //     "ShogunStaking: Training has already ended!"
  //   );
  // });

  // it("Should Display Training Level", async function () {
  //   let questInfo = await shogunStaking.getQuest(1);
  //   console.log(questInfo);
  //   // let unicornIds = await shogunStaking.getQuestUnicorns(1);
  //   // console.log(unicornIds);
  // });
});
