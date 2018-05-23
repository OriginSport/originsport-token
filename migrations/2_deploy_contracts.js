const OriginSportToken = artifacts.require("./OriginSportToken.sol")
const OriginSportTokenSale = artifacts.require("./OriginSportTokenSale.sol")

module.exports = function(deployer, network, accounts) {
  const publicSaleStartTime = new Date("May 21 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  const publicSaleEndTime   = new Date("Jun 05 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  console.log('-------------------------------------------------')
	console.log('publicSaleStartTime : ' + publicSaleStartTime)
	console.log('publicSaleStartTime : ' + new Date(publicSaleStartTime*1000))
	console.log('publicSaleEndTime   : ' + publicSaleEndTime)
	console.log('publicSaleEndTime   : ' + new Date(publicSaleEndTime*1000))
	console.log('-------------------------------------------------')
  // Address for test
  const tokenAddress = '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf'
  const walletAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const testAdminAddr = '0x00c6bFFba6eD9EA434AcB096D171C0a78e24D318'
 
  //Deploy with new OriginSportToken
  //OriginSportToken.new(publicSaleEndTime, accounts[1]).then(function(instance) {
  //deployer.deploy(OriginSportToken, accounts[1]).then(function(instance) {
  //  return deployer.deploy(OriginSportTokenSale, publicSaleStartTime, publicSaleEndTime, tokenAddress, walletAddress)
  //})
  deployer.deploy(OriginSportToken, testAdminAddr)
}
