const BigNumber = require('bignumber.js')
const { addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')

contract('OriginSportToken', function(accounts) {
  var owner = accounts[0]
  var admin = accounts[1]
  var user1 = accounts[2]
  var user2 = accounts[3]
  var user3 = accounts[4]
  var user4 = accounts[5]

  const TOTAL_SUPPLY = 3e26
  const amount = 10**18

  beforeEach(function() {
    return OriginSportToken.deployed().then(function(instance) {
      tokenInstance = instance
    })
  })

  // CREATION
  it("creation: should have an balance of 300 million tokens", async () => {
    const adminBalance = (await tokenInstance.balanceOf(admin)).toNumber()
    assert.equal(adminBalance, TOTAL_SUPPLY, "the admin should have 300 million tokens")
  })

  it('creation: test correct setting of vanity information', async () => {
    const totalSupply = await tokenInstance.totalSupply()
    assert.equal(totalSupply, TOTAL_SUPPLY, "total supply should have 300 million tokens")
    
    const name = await tokenInstance.name()
    assert.equal(name, 'Origin Sport Token')

    const decimal = await tokenInstance.decimal()
    assert.equal(decimal.toNumber(), 18)

    const symbol = await tokenInstance.symbol()
    assert.equal(symbol, 'ORS')
  })

  // TRANSERS
  it('transfers: should transfer amount to user1 with admin having amount', async () => {
    await tokenInstance.transfer(user1, amount, { from: admin })
    const balance = await tokenInstance.balanceOf(user1)
    assert.equal(balance.toNumber(), amount)
  })

  it('transfers: should transfer correctly', async () => {
    const balance0 = await tokenInstance.balanceOf(user1)
    await tokenInstance.transfer(user1, amount, { from: admin })
    const balance1 = await tokenInstance.balanceOf(user1)
    assert.equal(balance0, balance1 - amount)
  })

  it('transfers: normal user can not transfer correctly', async () => {
    await assertRevert(tokenInstance.transfer(user2, amount, { from: user1 }))
  })

  it('transfers: normal user can transfer correctly after enable transfer', async () => {
    await addDaysOnEVM(35)
    const balance1 = await tokenInstance.balanceOf(user1)
    await tokenInstance.transfer(user2, amount, { from: user1 })
    const balance2 = await tokenInstance.balanceOf(user2)
    assert.equal(balance1.toNumber(), balance2.add(amount).toNumber())
  })

  it('transfers: should fail when trying to transfer greater than TOTAL_SUPPLY to user1', async () => {
    await assertRevert(tokenInstance.transfer(user1, TOTAL_SUPPLY+1, { from: admin }))
  })

  it('transfers: should handle zero-transfers normally', async () => {
    assert(await tokenInstance.transfer(user1, 0, { from: admin }), 'zero-transfer has failed')
  })

  it('transfers: should throw  when trying to transfer to 0x0', async () => {
    await assertRevert(tokenInstance.transfer("0x00", amount, { from: admin }))
  })

  // APPROVALS
  it('approvals: msg.sender should approve 100 to user1', async () => {
    await tokenInstance.approve(user1, 100, { from: admin })
    const allowance = await tokenInstance.allowance(admin, user1)
    assert.equal(allowance.toNumber(), 100)
  })

  it('approvals: msg.sender approves user1 of 100 and withdraws 20 once', async () => {
    const balance = await tokenInstance.balanceOf(admin)
    await tokenInstance.approve(user4, 100, { from: admin })
    const balance3 = await tokenInstance.balanceOf(user3)
    assert.equal(balance3.toNumber(), 0, 'balance3 not correct')

    await tokenInstance.transferFrom(admin, user3, 20, { from: user4 })
    const allowance = await tokenInstance.allowance(admin, user4)
    assert.equal(allowance.toNumber(), 80, 'user4 balance not correct')

    const _balance3 = await tokenInstance.balanceOf(user3)
    assert.equal(_balance3.toNumber(), 20, 'user3 balance not correct after transfer')

    const _balance = await tokenInstance.balanceOf(admin)
    assert.equal(_balance.add(20).toNumber(), balance, 'admin balance not correct')
  })

  // Burn
  it("burn: total supply would decrease to 200 million", async () => {
    const supply0 = await tokenInstance.totalSupply()
    const balance0 = await tokenInstance.balanceOf(admin)
 
    const value = 1e26
    await tokenInstance.burn(value, { from: admin })

    const supply1 = await tokenInstance.totalSupply()
    const balance1 = await tokenInstance.balanceOf(admin)
    assert.equal(supply0.minus(value), supply1.toNumber(), "after burn total supply is not correct")
    assert.equal(balance0.minus(value), balance1.toNumber(), "after burn balance is not correct")
  })
})

