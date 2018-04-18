const web3 = require('web3')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')
const OriginSportDistribution = artifacts.require('./OriginSportDistribution.sol')

contract('OriginSportToken', function(accounts) {
  var owner = accounts[0]
  var user1 = accounts[1]
  var user2 = accounts[2]
  var user3 = accounts[3]

  beforeEach(function() {
    return OriginSportDistribution.deployed().then(function(instance) {
        saleInstance = instance
        return OriginSportToken.deployed()
    }).then(function(instance){
      tokenInstance = instance
      return tokenInstance.TOTAL_SUPPLY()
    })
  })

  it("should have 18 decimal places", async function() {
    const decimal = await tokenInstance.decimal()
    console.log(decimal)
    assert.equal(decimal.toNumber(), 1e18)
  })

  it("should have an balance of 300 million tokens", async function() {
      const ownerBalance = (await tokenInstance.balanceOf(owner)).toNumber()
      assert.equal(ownerBalance, 3e26, "the owner should have 300 million tokens")
  })
})

