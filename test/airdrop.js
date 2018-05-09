const { setTimestamp, addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')
const Airdrop = artifacts.require('./Airdrop.sol')

contract('Airdrop Test', function(accounts) {
  const owner = accounts[0]
  const admin = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]
  const user3 = accounts[4]
  const wallet = accounts[9]

  const decimal = 18
  const value = 5 * 10**18
  const tokenForAirdrop = 30000000 * 10 ** decimal
  const rate1 = 3750
  const rate2 = 3450
  const rate3 = 3150

  before(async () => {
    tokenInstance = await OriginSportToken.new(admin, { from: owner })
    airInstance  = await Airdrop.new(tokenInstance.address, { from: owner })
    await tokenInstance.transfer(airInstance.address, tokenForAirdrop, { from: admin })
  })

  it("check this airdrop contract can transfer tokens", async () => {
    const b = await tokenInstance.whitelistedTransfer(airInstance.address)
    assert.equal(b, false, "air contract should not able to transfer tokens")
    await tokenInstance.addWhitelistedTransfer(airInstance.address, { from: admin })
    const a = await tokenInstance.whitelistedTransfer(airInstance.address)
    assert.equal(a, true, "air contract can not transfer tokens")
  })

  it("test balance", async () => {
    const balance = await tokenInstance.balanceOf(airInstance.address)
    assert.equal(balance.toNumber(), tokenForAirdrop, "air contract ors balance should equal to tokenForAridrop")
  })

  it("test airdrop", async () => {
    const value = 10**decimal
    await airInstance.airdrop([user1, user2], value, { from: owner })
    const balance1 = await tokenInstance.balanceOf(user1)
    const balance2 = await tokenInstance.balanceOf(user2)
    assert.equal(balance1.toNumber(), balance2.toNumber(), "user1 and user2 balance should be equal")
    assert.equal(balance1.toNumber(), value, "user1 balance should be equal value")
  })
})
