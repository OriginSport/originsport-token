var OriginSportToken = artifacts.require("./OriginSportToken.sol");
var OriginSportDistribution = artifacts.require("./OriginSportDistribution.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(OriginSportToken, accounts[0]).then(function() {
    return deployer.deploy(OriginSportDistribution, new Date()/1000);
  });
};
