async function main() {
  const shogunNFT = await ethers
    .getContractFactory("ShogunNFT")
    .then((factory) => factory.attach(process.env.CONTRACT_ADDRESS));
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const vault = await sacrifice.vault().then((_v) => ethers.getSigner(_v));
  const isApprovedForAll = await shogunNFT.isApprovedForAll(
    vault.address,
    sacrifice.address
  );
  if (isApprovedForAll) {
    console.log("Vault has already been unlocked");
  } else {
    console.log(`Unlocking vault`);
    await shogunNFT.connect(vault).setApprovalForAll(sacrifice.address, true);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
