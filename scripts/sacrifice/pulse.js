async function main() {
  const shogunNFT = await ethers
    .getContractFactory("ShogunNFT")
    .then((factory) => factory.attach(process.env.CONTRACT_ADDRESS));
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const vault = await sacrifice.vault();
  const shogunOwner = await shogunNFT.owner();
  const vaultBalance = await shogunNFT["balanceOf(address)"](vault);

  console.log(`Vault is ${vault}`);
  console.log(`Vault samurai balance: ${vaultBalance}`);
  console.log(`ShogunNFT owner is: ${shogunOwner}`);
  console.log(`Paused: ${await sacrifice.paused()}`);
  console.log(`RevealedCount: ${await sacrifice.revealedCount()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
