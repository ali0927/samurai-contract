
async function main() {
  const shogunNFT = await ethers
    .getContractFactory("ShogunNFT")
    .then((factory) => factory.attach(process.env.CONTRACT_ADDRESS));
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const vault = await sacrifice.vault();
  const balanceBefore = await shogunNFT['balanceOf(address)'](vault);
  const signer = await ethers.getSigner(vault);
  const amount = process.env.MINT_AMOUNT
  console.log(`Minting ${amount} to ${vault}, which has ${balanceBefore} currently`);
  await shogunNFT.connect(signer).devMint(amount);
  const balanceAfter = await shogunNFT['balanceOf(address)'](vault);
  console.log(`Balance after: ${balanceAfter}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
