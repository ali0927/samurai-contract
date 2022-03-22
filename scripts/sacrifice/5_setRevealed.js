async function main() {
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const owner = await sacrifice.owner().then((_o) => ethers.getSigner(_o));
  const revealedCount = parseInt(process.env.REVEALED_COUNT);
  console.log(`Setting revealedCount to ${revealedCount}`);
  await sacrifice.connect(owner).setRevealedCount(revealedCount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
