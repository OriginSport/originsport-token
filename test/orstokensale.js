const { addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')
const OriginSportTokenSale = artifacts.require('./OriginSportTokenSale.sol')

contract('OriginSportTokenSale Test', function(accounts) {
  const owner = accounts[0]
  const admin = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]
  const user3 = accounts[4]
  const wallet = accounts[9]

  const publicSaleStartTime = new Date("May 21 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  const publicSaleEndTime   = new Date("Jun 05 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  
  const decimal = 18
  const value = 5 * 10**18
  const tokenForPublicSale = 112500000 * 10 ** decimal
  const rate1 = 3750
  const rate2 = 3450
  const rate3 = 3150

  /* some build-in constant params to validate
  uint public constant decimal = 18
  uint public constant AVAILABLE_TOTAL_SUPPLY    = 300000000 * 18 ** uint(decimal)
  uint public constant AVAILABLE_PUBLIC_SUPPLY   =  90000000 * 18 ** uint(decimal) // 30%
  uint public constant AVAILABLE_PRIVATE_SUPPLY  =  45000000 * 18 ** uint(decimal) // 15%
  uint public constant MINIMAL_CONTRIBUTION      =         2 * 10 ** uint(decimal-1)

  uint public constant GOAL                      = 18000 ether
  uint public constant HARD_CAP                  = 30000 ether

  uint public constant    BASE_RATE              = 3000
  uint public constant PRIVATE_RATE              = 4050 // 35% bonus, 2018-04-20 - 2018-05-20
  uint public constant  ROUND1_RATE              = 3750 // 25% bonus, 2018-05-21 - 2018-05-26
  uint public constant  ROUND2_RATE              = 3450 // 15% bonus, 2018-05-26 - 2018-05-31
  uint public constant  ROUND3_RATE              = 3150 //  5% bonus, 2018-05-31 - 2018-06-05
  */

  context("OriginSportToken sale initialization", async () => {
    before(async () => {
      tokenInstance = await OriginSportToken.new(admin, { from: owner })
      saleInstance  = await OriginSportTokenSale.new(publicSaleStartTime, publicSaleEndTime, tokenInstance.address, wallet, { from: owner })
      await tokenInstance.transfer(saleInstance.address, tokenForPublicSale, { from: admin })
    })
    
    it("initial tokensale and check property is all correct", async () => {
      const startTime = await saleInstance.startTime()
      const endTime= await saleInstance.endTime()
      const _wallet = await saleInstance.wallet()
      const token = await saleInstance.token()
      const raised = await saleInstance.weiRaised()
      const sold = await saleInstance.tokenSold()

      assert.equal(startTime, publicSaleStartTime, "start time is not correct")
      assert.equal(endTime, publicSaleEndTime, "end time is not correct")
      assert.equal(_wallet, wallet, "wallet address is not correct")
      assert.equal(token, tokenInstance.address, "token address is not correct")
      assert.equal(raised, 0, "raised amount is not correct")
      assert.equal(sold, 0, "sold amount is not correct")
    })
  })

  context("Check basic contribute function", async () => {
    beforeEach(async () => {
      tokenInstance = await OriginSportToken.new(admin, { from: owner })
      saleInstance  = await OriginSportTokenSale.new(publicSaleStartTime, publicSaleEndTime, tokenInstance.address, wallet, { from: owner })
      await tokenInstance.transfer(saleInstance.address, tokenForPublicSale, { from: admin })
      await tokenInstance.addWhitelistedTransfer(saleInstance.address, { from: admin })
    })
    
    it("contribute when token sale is not start will failed", async () => {
      await assertRevert(saleInstance.sendTransaction({ from: user1, value:value }))
    })

    it("contribute when token sale is started will success", async () => {
      await addDaysOnEVM(20)
      await saleInstance.sendTransaction({ from: user1, value: value })
      const raised = await saleInstance.weiRaised()
      const balance = await tokenInstance.balanceOf(user1)
      assert.equal(raised.toNumber(), value, "raised eth is not correct")
      assert.equal(balance.toNumber(), value * rate1, "user received ors amount is not correct")
    })

    it("contribute amount less than minimum will failed", async () => {
      await addDaysOnEVM(20)
      const value = 1 * 10**17
      await assertRevert(saleInstance.sendTransaction({ from: user1, value: value }))
    })

    it("if contract paused, every contribute will failed", async () => {
      await addDaysOnEVM(20)
      await saleInstance.pause({ from: owner })
      await assertRevert(saleInstance.sendTransaction({ from: user2, value: value }))
    })

    it("after contract unpaused, contribute will return normal", async () => {
      await addDaysOnEVM(20)
      await saleInstance.unpause({ from: owner })
      await saleInstance.sendTransaction({ from: user1, value: value })
      const raised = await saleInstance.weiRaised()
      const balance = await tokenInstance.balanceOf(user1)
      assert.equal(raised.toNumber(), value, "raised eth is not correct")
      assert.equal(balance.toNumber(), value * rate1, "user received ors amount is not correct")
    })

    it("if sale has reached end time, contribute will failed", async() => {
      await addDaysOnEVM(35)
      await assertRevert(saleInstance.sendTransaction({ from: user3, value: value }))
    })
  })

  context("Check rate in differen periods", async () => {
    beforeEach(async () => {
      tokenInstance = await OriginSportToken.new(admin, { from: owner })
      saleInstance  = await OriginSportTokenSale.new(publicSaleStartTime, publicSaleEndTime, tokenInstance.address, wallet, { from: owner })
      await tokenInstance.transfer(saleInstance.address, tokenForPublicSale, { from: admin })
      await tokenInstance.addWhitelistedTransfer(saleInstance.address, { from: admin })
    })
    
    it("contribute in first 5 days rate is rate1", async () => {
      await addDaysOnEVM(20)
      await saleInstance.sendTransaction({ from: user1, value: value })
      const raised = await saleInstance.weiRaised()
      const balance = await tokenInstance.balanceOf(user1)
      assert.equal(raised.toNumber(), value, "raised eth is not correct")
      assert.equal(balance.toNumber(), value * rate1, "user received ors amount is not correct with rate2")
    })

    it("contribute in second 5 days rate is rate2", async () => {
      await addDaysOnEVM(25)
      await saleInstance.sendTransaction({ from: user1, value: value })
      const raised = await saleInstance.weiRaised()
      const balance = await tokenInstance.balanceOf(user1)
      assert.equal(raised.toNumber(), value, "raised eth is not correct")
      assert.equal(balance.toNumber(), value * rate2, "user received ors amount is not correct with rate2")
    })

    it("contribute in last 5 days rate is rate3", async () => {
      await addDaysOnEVM(30)
      await saleInstance.sendTransaction({ from: user1, value: value })
      const raised = await saleInstance.weiRaised()
      const balance = await tokenInstance.balanceOf(user1)
      assert.equal(raised.toNumber(), value, "raised eth is not correct")
      assert.equal(balance.toNumber(), value * rate3, "user received ors amount is not correct with rate3")
    })
  })
})
