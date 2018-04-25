const BigNumber = require('bignumber.js')
const { addsDayOnEVM, assertRevert } = require('./helpers')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')

contract('OriginSportToken', function(accounts) {
  var owner = accounts[0]
  var admin = accounts[1]
  var user1 = accounts[2]
  var user2 = accounts[3]

  const TOTAL_SUPPLY = 3e26

  beforeEach(function() {
    return OriginSportToken.deployed().then(function(instance) {
      tokenInstance = instance
      addsDayOnEVM(60);
    })
  })

  // CREATION
  it("creation: should have an balance of 300 million tokens", async () => {
    const ownerBalance = (await tokenInstance.balanceOf(owner)).toNumber()
    assert.equal(ownerBalance, TOTAL_SUPPLY, "the owner should have 300 million tokens")
  })

  it('creation: test correct setting of vanity information', async () => {
    const totalSupply = await tokenInstance.totalSupply()
    assert.equal(totalSupply, TOTAL_SUPPLY, "total supply should have 300 million tokens")
    
    const name = await tokenInstance.name()
    assert.equal(name, 'Origin Sport Token')

    const decimal = await tokenInstance.decimal()
    assert.equal(decimal.toNumber(), 18)

    const symbol = await tokenInstance.symbol()
    assert.strictEqual(symbol, 'ORS')
  })

  // TRANSERS
  // normal transfers without approvals
  it('transfers: ether transfer should be reversed.', async () => {
    const balanceBefore = (await tokenInstance.balanceOf(owner)).toNumber()
    assert.equal(balanceBefore, TOTAL_SUPPLY, "before transaction balance is already not correct")

    await assertRevert(new Promise((resolve, reject) => {
      web3.eth.sendTransaction({ from: owner, to: tokenInstance.address, value: web3.toWei('10', 'Ether') }, (err, res) => {
        if (err) { reject(err) }
        resolve(res)
      })
    }))

    const balanceAfter = (await tokenInstance.balanceOf(owner)).toNumber()
    assert.equal(balanceAfter, TOTAL_SUPPLY, "after transaction balance is not correct")
  })

  it('transfers: should transfer 10000 to user1 with owner having 10000', async () => {
    await tokenInstance.transfer(user1, 10000, { from: owner })
    const balance = await tokenInstance.balanceOf(user1)
    assert.equal(balance.toNumber(), 10000)
  })

  it('transfers: should fail when trying to transfer greater than TOTAL_SUPPLY to user1', async () => {
    await assertRevert(tokenInstance.transfer(user1, TOTAL_SUPPLY+1, { from: owner }))
  })

  it('transfers: should handle zero-transfers normally', async () => {
    assert(await tokenInstance.transfer(user1, 10001, { from: owner }), 'zero-transfer has failed')
  })

  // APPROVALS
  it('approvals: msg.sender should approve 100 to user1', async () => {
    await tokenInstance.approve(user1, 100, { from: owner })
    const allowance = await tokenInstance.allowance(owner, user1)
    assert.equal(allowance.toNumber(), 100)
  })

  it('approvals: msg.sender approves user1 of 100 and withdraws 20 once', async () => {
    const balance = await tokenInstance.balanceOf(owner)
    assert.equal(balance.toNumber(), TOTAL_SUPPLY)

    await tokenInstance.approve(user1, 100, { from: owner})
    const balance2 = await tokenInstance.balanceOf(user2)
    assert.equal(balance2.toNumber(), 0, 'balance2 not correct')

    await tokenInstance.allowance(owner, user1)
    await tokenInstance.transferFrom(owner, user2, 20, { from: user1 })
    const allowance = await tokenInstance.allowance(owner, user1)
    assert.equal(allowance.toNumber(), 80, 'user1 balance not correct')

    const _balance2 = await tokenInstance.balanceOf(user2)
    assert.equal(_balance2.toNumber(), 20, 'user2 balance not correct after transfer')

    const _balance = await tokenInstance.balanceOf(owner)
    assert.equal(_balance.toNumber(), TOTAL_SUPPLY-20, 'owner balance not correct')
  })

  // Burn
  it("burn: total supply would decrease to 200 million", async () => {
    const supply0 = await tokenInstance.totalSupply()
    const balance0 = await tokenInstance.balanceOf(owner)
 
    const value = 1e26
    await tokenInstance.burn(value, { from: owner })

    const supply1 = await tokenInstance.totalSupply()
    const balance1 = await tokenInstance.balanceOf(owner)
 
    const _totalSupply = await tokenInstance.totalSupply()
    assert.equal(supply0.minus(value), supply1.toNumber(), "after burn total supply is not correct")
    assert.equal(balance0.minus(value), balance1.toNumber(), "after burn balance is not correct")
  })
})

