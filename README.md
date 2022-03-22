# Shogun Samurai NFT

</br>
Presale: 16 October 0800 SGT
 </br>
Public Sale: 17 October Public sale 1200
</br>

Automate Test Scenarios

```sh
$ npx hardhat test
```

To Compile SCript

```sh
$ npx hardhat compile
```

```sh
Spinning up a local blockchain
$ npx hardhat node
```

You should see a list of accounts generated, use them to update the other scripts respectively

```sh
Deploying smart contract onto the local network
$ npx hardhat run —network localhost scripts/deploy.js

Spin up console to interact with blockchain
$ npx hardhat console —network localhost

Interact with smart contract using scripts
$ npx hardhat run --network localhost scripts/<scriptname>
```

Official Deployment on Rinkeby Testnet

```sh
Deploying smart contract to Rinkeby Netwwork
$ npm run deploy

Verifying contract using hardhat
$ npx hardhat verify --constructor-args deploy_args.js <Contract Address> --network rinkeby

Interacting with smart contract using scripts, to see list of commands:
$ npm run

If you meet with any mismatch issues, clean, compile and deploy again
$ npx hardhat clean
```

## New commands

`start-shogun` : Start a local node with ShogunNFT
`start-sacrifice` : Start a local node with ShogunNFT + Sacrifice
`test-sacrifice` : Test Sacrifice Smart Contract
`deploy-sacrifice-rinkeby` : Deploy Sacrifice Smart Contract to Rinkeby
`deploy-sacrifice-mainnet` : Deploy Sacrifice Smart Contract to Mainnet
