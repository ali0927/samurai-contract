# Shogun Samurai NFT

## Contract Addresses

ShogunSamurais:
https://etherscan.io/address/0x8399d6351fd0ddb33f77bfc627e3264d74500d22

Shogun Token:
Proxy: https://etherscan.io/address/0xf9abaeec0334fd30804446db7423abe0c02ef47d
Implementation: https://etherscan.io/address/0x8949dad04f5f78425df67720849668c5a10fb10f#code

Shogun Staking:
Proxy: https://etherscan.io/address/0xc4f4811a854b60f7b35c8e46c4f2ebfdd035bed1
Implementation: https://etherscan.io/address/0xc564ad6cf96bea48df5e44c11c08ec7e6f0bfb75#code

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
