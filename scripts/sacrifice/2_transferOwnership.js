async function main() {
  const shogunNFT = await ethers
    .getContractFactory("ShogunNFT")
    .then((factory) => factory.attach(process.env.CONTRACT_ADDRESS));
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const vault = await sacrifice.vault();
  const owner = await sacrifice.owner();
  const toVault = !!parseInt(process.env.TO_VAULT ?? "0");
  console.log(`Transferring ownership to ${toVault ? "vault" : "dev"}`);
  const signer = await (toVault
    ? ethers.getSigner(owner)
    : ethers.getSigner(vault));
  const target = toVault ? vault : owner;
  await shogunNFT.connect(signer)["transferOwnership(address)"](target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
