const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const CryptoMarriage = artifacts.require("CryptoMarriage");

module.exports = async function (deployer) {
  const instance = await deployProxy(CryptoMarriage, { deployer });
  console.log("Deployed", instance.address);
};
