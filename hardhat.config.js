require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// This is a sample Hardhat config file for Chiliz Chain
// Make sure to add your private key and other sensitive data to .env file

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris", // EVM version 19 as mentioned in Chiliz docs
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Chiliz Chain Mainnet
    chiliz: {
      url: "https://rpc.chiliz.com",
      chainId: 88888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2500000000000, // 2,500 gwei minimum as per Chiliz docs
      gas: 8000000,
    },
    // Chiliz Chain Testnet (Spicy)
    spicy: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 2500000000000, // 2,500 gwei minimum
      gas: 8000000,
    },
  },
  etherscan: {
    apiKey: {
      chiliz: process.env.CHILISCAN_API_KEY || "your-api-key-here",
      spicy: process.env.CHILISCAN_API_KEY || "your-api-key-here",
    },
    customChains: [
      {
        network: "chiliz",
        chainId: 88888,
        urls: {
          apiURL: "https://chiliscan.com/api",
          browserURL: "https://chiliscan.com",
        },
      },
      {
        network: "spicy",
        chainId: 88882,
        urls: {
          apiURL: "https://spicy-explorer.chiliz.com/api",
          browserURL: "https://spicy-explorer.chiliz.com",
        },
      },
    ],
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
}; 