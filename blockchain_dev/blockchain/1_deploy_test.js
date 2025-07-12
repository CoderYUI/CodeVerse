const TestDeploy = artifacts.require("TestDeploy");

module.exports = function (deployer) {
  deployer.deploy(TestDeploy);
};