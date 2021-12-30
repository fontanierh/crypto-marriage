const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*",
    },
    mumbai_testnet: {
      provider: () =>
        new HDWalletProvider({
          // privateKeys: [process.env.PRIVATE_KEY],
          mnemonic: process.env.MNEMONIC,
          providerOrUrl: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          // addressIndex: 0,
        }),
      network_id: 80001,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: false,
      from: "0x16aB11F8ABaCdCf47A17CE5966Ef99Db18122575",
    },
    matic_mainnet: {
      provider: () =>
        new HDWalletProvider({
          // privateKeys: [process.env.PRIVATE_KEY],
          mnemonic: process.env.MNEMONIC,
          providerOrUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          addressIndex: 0,
        }),
      network_id: "137",
      from: "0xF9984Db6A3bd7044f0d22c9008ddA296C0CC5468",
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 1000000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.7",
    },
  },
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.EXPLORER_API_KEY || "",
  },
};
