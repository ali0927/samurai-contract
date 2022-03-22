const { expect } = require("chai");
const { ethers } = require("hardhat");
const addressesToWhitelist = require("../data/whitelistAddresses.json");
const PRESALE_SIGNER_PRIVATE_KEY =
  "0x61d85909fbd96edb58473c9935f2f4f94fd85ff8ea5e2f768053d4b1c247fdce";
const PUBLIC_SIGNER_PRIVATE_KEY =
  "0xd406b883fcd791d8feae854de7739f1ba3cd0707c4336b83e088b8582ae7d9e1";
const PRESALE_SIGNER_ADDRESS = "0x8ce775121d54eec43a52a5ea8a8ACf4dF223209C";
const PUBLIC_SIGNER_ADDRESS = "0x5c3f5a467807239a499BD9C8eD7C5a42133C91B0";
const presaleSigningKey = new ethers.utils.SigningKey(
  PRESALE_SIGNER_PRIVATE_KEY
);
const publicSigningKey = new ethers.utils.SigningKey(PUBLIC_SIGNER_PRIVATE_KEY);

function chunkArray(myArray, chunk_size) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

const signAddress = (address, signingKey) => {
  const nonce = ethers.utils.randomBytes(32);
  const msgHash = ethers.utils.keccak256(
    ethers.utils.hexConcat([address, nonce])
  );
  const signature = ethers.utils.joinSignature(signingKey.signDigest(msgHash));
  return { signature, nonce: ethers.utils.hexlify(nonce) };
};

describe("Token contract", () => {
  let ShogunNFT, shogunNFT, owner, addr1, addr2, addr3;

  beforeEach(async () => {
    ShogunNFT = await ethers.getContractFactory("ShogunNFT");
    [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
    shogunNFT = await ShogunNFT.deploy(
      "ShogunSamurai",
      "SGS",
      "", // initBaseUri
      "https://gateway.pinata.cloud/ipfs/QmapYhnPuWZpY8dk7E2tAzRjLr6rvHyXCStViyjv1LECTi", // notrevealedURI
      PRESALE_SIGNER_ADDRESS,
      PUBLIC_SIGNER_ADDRESS,
      addr3.address // treasury wallet
    );
  });

  describe("Deployment", () => {
    it("should set the right owner", async () => {
      expect(await shogunNFT.owner()).to.equal(owner.address);
    });

    it("should initialize the right parameters", async () => {
      expect(await shogunNFT.maxSupply()).to.equal(8888);
      expect(await shogunNFT.maxMintPerTxn()).to.equal(4);
      expect(await shogunNFT.nftPerAddressLimitPublic()).to.equal(8);
      expect(await shogunNFT.nftPerAddressLimitPresale()).to.equal(2);
      expect(await shogunNFT.paused()).to.equal(false);
      expect(await shogunNFT.revealed()).to.equal(false);
      expect(await shogunNFT.isPresaleOpen()).to.equal(false);
      expect(await shogunNFT.isPublicSaleOpen()).to.equal(false);
    });
  });

  describe("Before Presale Starts", () => {
    it("should mint NFT tokens to owner account", async () => {
      const supply = await shogunNFT.totalSupply();
      const tokenId = supply + 1;

      expect(await shogunNFT.devMint(1, { value: 0 }))
        .to.emit(shogunNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, tokenId);
    });

    it("should fail if public members tries to mint", async () => {
      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      // const shogunPrice = await shogunNFT.cost();
      const mintAmount = 1;
      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("public sale has not started");

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance
      );
    });
  });

  describe("Whitelisting process and starting presales", () => {
    it("should add users to whitelist", async () => {
      addressesArray = chunkArray(addressesToWhitelist, 400);

      for (array of addressesArray) {
        txn = await (await shogunNFT.whitelistUsers(array)).wait();
      }

      userWhitelisted = await shogunNFT.whitelistedAddresses(
        addressesToWhitelist[0]
      );

      expect(userWhitelisted).to.equal(true);
    });

    it("should start presales", async () => {
      await shogunNFT.setPresaleOpen(true);
      expect(await shogunNFT.presaleOpen()).to.equal(true);
    });
  });

  describe("During presales", () => {
    it("should allow whitelisted users to mint", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPresaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();
      const { nonce, signature } = signAddress(
        addr1.address,
        presaleSigningKey
      );

      await expect(
        shogunNFT.connect(addr1).presaleMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, tokenId + 1);

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );
    });

    it("should not allow whitelisted users to mint more than 2", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPresaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 3;
      const tokenId = await shogunNFT.totalSupply();

      const { nonce, signature } = signAddress(
        addr1.address,
        presaleSigningKey
      );
      await expect(
        shogunNFT.connect(addr1).presaleMint(nonce, signature, mintAmount, {
          value: "240000000000000000",
        })
      ).to.be.revertedWith(
        "you can only mint a maximum of two nft during presale"
      );

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance
      );
    });

    it("should not allow non-whitelisted users to mint", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPresaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr2.address);
      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();

      const { nonce, signature } = signAddress(
        addr2.address,
        presaleSigningKey
      );

      await expect(
        shogunNFT.connect(addr2).presaleMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("you are not in the whitelist");

      expect(await shogunNFT.balanceOf(addr2.address)).to.equal(
        initialUserBalance
      );
    });

    it("should not allow invalid signatures to mint", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPresaleOpen(true);

      const mintAmount = 1;

      const { nonce, signature } = signAddress(
        "0x" + "deadbeef".repeat(5),
        presaleSigningKey
      );

      await expect(
        shogunNFT.connect(addr1).presaleMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("invalid signature");
    });

    it("should not allow reuse of nonces", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPresaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();

      const { nonce, signature } = signAddress(
        addr1.address,
        presaleSigningKey
      );
      await expect(
        shogunNFT.connect(addr1).presaleMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, tokenId + 1);

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );

      await expect(
        shogunNFT.connect(addr1).presaleMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("nonce was used");

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );
    });
  });

  describe("Public sale", () => {
    it("should allow any user to mint", async () => {
      // add user to whitelist
      const whitelistedAddress = [addr1.address];
      await shogunNFT.whitelistUsers(whitelistedAddress);

      // start presale
      await shogunNFT.setPublicSaleOpen(true);

      // try minting with a whitelisted user
      var initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 4;
      var tokenId = parseInt(await shogunNFT.totalSupply());

      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "320000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          addr1.address,
          tokenId + mintAmount
        );

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );

      // try minting with a non-whitelisted user
      var initialUserBalance = await shogunNFT.balanceOf(addr2.address);
      var tokenId = parseInt(await shogunNFT.totalSupply());
      const { nonce: nonce2, signature: signature2 } = signAddress(
        addr2.address,
        publicSigningKey
      );
      await expect(
        shogunNFT.connect(addr2).publicMint(nonce2, signature2, mintAmount, {
          value: "320000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          addr2.address,
          tokenId + mintAmount
        );

      expect(await shogunNFT.balanceOf(addr2.address)).to.equal(
        initialUserBalance + mintAmount
      );
    });

    it("should not allow more than 4 mint per transaction", async () => {
      // start presale
      await shogunNFT.setPublicSaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 5;
      const tokenId = await shogunNFT.totalSupply();

      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "400000000000000000",
        })
      ).to.be.revertedWith("exceeded max mint amount per transaction");

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance
      );
    });

    it("should not allow more than 8 NFT holding from public mint", async () => {
      await shogunNFT.setPublicSaleOpen(true);

      var initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      var mintAmount = 4;
      var tokenId = parseInt(await shogunNFT.totalSupply());

      // first mint of 4
      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "320000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          addr1.address,
          tokenId + mintAmount
        );

      var tokenId = parseInt(await shogunNFT.totalSupply());
      // second mint of 4
      const { nonce: nonce2, signature: signature2 } = signAddress(
        addr1.address,
        publicSigningKey
      );
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce2, signature2, mintAmount, {
          value: "320000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          addr1.address,
          tokenId + mintAmount
        );

      // check if the user has a total of 8
      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount * 2
      );

      // try to mint more than 8
      var mintAmount = 1;
      var tokenId = await shogunNFT.totalSupply();

      const { nonce: nonce3, signature: signature3 } = signAddress(
        addr1.address,
        publicSigningKey
      );
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce3, signature3, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("You have exceeded max amount of mints");
    });

    it("should not allow minting with insufficient value", async () => {
      // start presale
      await shogunNFT.setPublicSaleOpen(true);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();

      // sending in 0.07 eth instead of 0.08 required
      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "70000000000000000",
        })
      ).to.be.revertedWith("not enough ether sent for mint amount");

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance
      );
    });
    it("should forward minting fee to treasury", async () => {
      // start presale
      await shogunNFT.setPublicSaleOpen(true);
      expect(await shogunNFT.treasury()).to.equal(addr3.address);

      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const initialTreasuryBalance = await ethers.provider.getBalance(
        addr3.address
      );

      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();
      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          addr1.address,
          tokenId + mintAmount
        );

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );

      const finalTreasuryBalance = await ethers.provider.getBalance(
        addr3.address
      );
      expect(finalTreasuryBalance).to.equal(
        initialTreasuryBalance.add(
          new ethers.BigNumber.from("80000000000000000")
        )
      );
    });

    it("should not allow invalid signatures to mint", async () => {
      await shogunNFT.setPublicSaleOpen(true);
      const mintAmount = 1;
      const { nonce, signature } = signAddress(
        "0x" + "deadbeef".repeat(5),
        publicSigningKey
      );
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("invalid signature");
    });

    it("should not allow reuse of nonces", async () => {
      await shogunNFT.setPublicSaleOpen(true);
      const initialUserBalance = await shogunNFT.balanceOf(addr1.address);
      const mintAmount = 1;
      const tokenId = await shogunNFT.totalSupply();
      const { nonce, signature } = signAddress(addr1.address, publicSigningKey);
      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      )
        .to.emit(shogunNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, tokenId + 1);

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );

      await expect(
        shogunNFT.connect(addr1).publicMint(nonce, signature, mintAmount, {
          value: "80000000000000000",
        })
      ).to.be.revertedWith("nonce was used");

      expect(await shogunNFT.balanceOf(addr1.address)).to.equal(
        initialUserBalance + mintAmount
      );
    });
  });

  describe("Post launch reveal", async () => {
    it("should change baseURI after reveal", async () => {
      // minting 1 nft using dev
      const supply = await shogunNFT.totalSupply();
      const tokenId = supply + 1;

      expect(await shogunNFT.devMint(1, { value: 0 }))
        .to.emit(shogunNFT, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, tokenId);

      //reveal
      expect(await shogunNFT.tokenURI(tokenId)).to.equal(
        "https://gateway.pinata.cloud/ipfs/QmapYhnPuWZpY8dk7E2tAzRjLr6rvHyXCStViyjv1LECTi"
      );

      // initial baseURI should be empty string
      expect(await shogunNFT.baseURI()).to.equal("");
      // update baseURI
      await shogunNFT.setBaseURI("newBaseURI/");
      // revea;
      await shogunNFT.reveal();

      expect(await shogunNFT.tokenURI(tokenId)).to.equal("newBaseURI/1");
    });
  });

  describe("Sacrifice contract", async () => {
    let Sacrifice, sacrifice, vault, vaultAddress, address1;

    beforeEach(async () => {
      vault = addr3;
      vaultAddress = await vault.getAddress();
      address1 = await addr1.getAddress();
      Sacrifice = await ethers.getContractFactory("Sacrifice");
      sacrifice = await Sacrifice.deploy(shogunNFT.address, vaultAddress);
      await shogunNFT.connect(vault).setApprovalForAll(sacrifice.address, true);
      await shogunNFT.connect(addr1).setApprovalForAll(sacrifice.address, true);
    });

    describe("Deployment", () => {
      it("should set the right owner", async () => {
        expect(await sacrifice.owner()).to.equal(owner.address);
      });

      it("should initialize the right parameters", async () => {
        expect(await sacrifice.paused()).to.equal(true);
        expect(await sacrifice.shogunNFT()).to.equal(shogunNFT.address);
        expect(await sacrifice.vault()).to.equal(vaultAddress);
      });
    });

    async function setupMint(revealedCount, vaultCount) {
      await shogunNFT.connect(owner).devMint(revealedCount);
      await sacrifice.connect(owner).setPaused(false);
      await sacrifice.connect(owner).setRevealedCount(revealedCount);
      await shogunNFT.connect(owner).transferOwnership(vaultAddress);
      await shogunNFT.connect(vault).devMint(vaultCount);
      await shogunNFT
        .connect(vault)
        .transferOwnership(await owner.getAddress());
      await shogunNFT
        .connect(owner)
        .airdrop(Array.from({ length: revealedCount }).map((_) => address1));
    }

    describe("Sacrifice", () => {
      it("should be able to sacrifice", async () => {
        await setupMint(1, 1);

        const beforeSupply = await shogunNFT.totalSupply();
        // sacrifice
        await sacrifice.connect(addr1).sacrifice(1);
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
        await sacrifice.connect(addr1).sacrifice(1);
        await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
        // pause contract
        await expect(sacrifice.connect(owner).setPaused(true)).to.emit(sacrifice, "Paused");
        await expect(sacrifice.connect(addr1).sacrifice(2)).to.be.revertedWith(
          "Pausable: paused"
        );
        // not burnt
        expect(await shogunNFT.ownerOf(2)).to.be.equal(address1);
      });

      it("should not be able to sacrifice unrevealed samurai", async () => {
        await setupMint(1, 3);

        // sacrifice
        await sacrifice.connect(addr1).sacrifice(1);
        await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
        // cannot burn unrevealed
        await expect(sacrifice.connect(addr1).sacrifice(2)).to.be.revertedWith(
          "SHOGUN: cannot sacrifice unrevealed samurai"
        );
      });

      it("should not be able to sacrifice when supply is exhausted", async () => {
        await setupMint(3, 1);
        // sacrifice
        await sacrifice.connect(addr1).sacrifice(1);
        await expect(shogunNFT.ownerOf(1)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
        // cannot sacrifice when there are no more samurais left
        await expect(sacrifice.connect(addr1).sacrifice(2)).to.be.revertedWith(
          "SHOGUN: no more samurais available"
        );
        expect(await shogunNFT.ownerOf(2)).to.be.equal(address1);
      });
    });
  });
});
