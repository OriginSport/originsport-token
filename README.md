# Origin Sport Token
<a href="https://t.me/OriginSport_EN" target="_blank"><img src="https://img.shields.io/badge/20k+-telegram-blue.svg"></a>

This is a smart contract about origin sport token sale

## Dependencies
1. nodejs, and make sure it's version above 8.0.0
2. npm
3. truffle
4. ganache

## Build
1. First run `npm install` to install node_modules
2. Then run `truffle compile`

## Run tests
1. run `truffle test` to execute tests

## Deploy
1. Before deploy you need to add your owner mnemonic to `truffle.js` like this:
```
const HDWalletProvider = require("truffle-hdwallet-provider")
const mnemonic = '<----12 words---->'

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/<----YOUR_API_KEY---->")
      },
      network_id: 3,
      gas: 4000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```
2. run `truffle deploy --network testnet` to deploy contract to ropsten network
3. run `truffle deploy --network mainnet` to deploy contract to mainnet network

## Live on Ethereum

The contracts are currently available on both Ethereum mainnet and testnet (ropsten).

### Mainnet

ORS Token: [0xeb9a4b185816c354db92db09cc3b50be60b901b6](https://etherscan.io/address/0xeb9a4b185816c354db92db09cc3b50be60b901b6)

### Testnet

ORS Token: [0x0a22dccf5bd0faa7e748581693e715afefb2f679](https://ropsten.etherscan.io/address/0x0a22dccf5bd0faa7e748581693e715afefb2f679)

