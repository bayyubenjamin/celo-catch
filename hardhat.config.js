import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220
    }
  },
  etherscan: {
    apiKey: {
      celo: process.env.CELOSCAN_API_KEY // Gunakan API Key dari Etherscan.io
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api", // Endpoint Etherscan V2 yang lu masukin udah bener
          browserURL: "https://celoscan.io/" // Output bakal lari ke Celoscan
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};
