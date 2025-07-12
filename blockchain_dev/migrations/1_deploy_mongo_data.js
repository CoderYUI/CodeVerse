const MongoDataStorage = artifacts.require("MongoDataStorage");

module.exports = function (deployer) {
  deployer.deploy(MongoDataStorage);
};
