async function main() {
  const sacrifice = await ethers
    .getContractFactory("Sacrifice")
    .then((factory) => factory.attach(process.env.SACRIFICE_CONTRACT_ADDRESS));
  const owner = await sacrifice.owner().then((_o) => ethers.getSigner(_o));
  const pause = !!parseInt(process.env.SET_PAUSED ?? "1");
  console.log(`Setting paused to ${pause}`);
  await sacrifice.connect(owner).setPaused(pause);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
