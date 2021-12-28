const CryptoMarriage = artifacts.require("CryptoMarriage");

module.exports = async function (deployer) {
  deployer.deploy(CryptoMarriage);
};
