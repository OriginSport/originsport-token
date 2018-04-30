const OriginSportToken = artifacts.require("./OriginSportToken.sol")
const OriginSportTokenSale = artifacts.require("./OriginSportTokenSale.sol")

Date.prototype.getUnixTime = function() { 
  return this.getTime()/1000|0
}

if(!Date.now) {
  Date.now = function() { 
    return new Date()
  }
}

Date.time = function() { 
  return Date.now().getUnixTime()
}

module.exports = function(deployer, network, accounts) {
  const publicSaleStartTime = new Date("Tue, 15 May 2018 08:00:00 GMT").getUnixTime()
  const publicSaleEndTime = new Date("Wed, 30 May 2018 08:00:00 GMT").getUnixTime()
  console.log('-------------------------------------------------')
	console.log('publicSaleStartTime : ' + publicSaleStartTime)
	console.log('publicSaleStartTime : ' + new Date(publicSaleStartTime*1000))
	console.log('publicSaleEndTime   : ' + publicSaleEndTime)
	console.log('publicSaleEndTime   : ' + new Date(publicSaleEndTime*1000))
	console.log('-------------------------------------------------')
  deployer.deploy(OriginSportToken, publicSaleEndTime, accounts[1]).then(function() {
    return deployer.deploy(OriginSportTokenSale, publicSaleStartTime, publicSaleEndTime)
  })
}
