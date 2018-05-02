const web3 = require('web3')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')
const OriginSportTokenSale = artifacts.require('./OriginSportTokenSale.sol')

contract('OriginSportTokenSale Test', function(accounts) {
  var owner = accounts[0]
  var user1 = accounts[1]
  var user2 = accounts[2]
  var user3 = accounts[3]
  var wallet = accounts[9]

  const publicSaleStartTime = new Date("May 21 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  const publicSaleEndTime   = new Date("Jun 05 2018 14:00:00 GMT+0800").getTime() / 1000 | 0
  
  const decimal = 18
  const tokenForPublicSale = 300000000 * 18 ** decimal

  /* some build-in constant params to validate
  uint public constant decimal = 18;
  uint public constant AVAILABLE_TOTAL_SUPPLY    = 300000000 * 18 ** uint(decimal);
  uint public constant AVAILABLE_PUBLIC_SUPPLY   =  90000000 * 18 ** uint(decimal); // 30%
  uint public constant AVAILABLE_PRIVATE_SUPPLY  =  45000000 * 18 ** uint(decimal); // 15%
  uint public constant MINIMAL_CONTRIBUTION      =         2 * 10 ** uint(decimal-1);

  uint public constant GOAL                      = 18000 ether;
  uint public constant HARD_CAP                  = 30000 ether;

  uint public constant    BASE_RATE              = 3000;
  uint public constant PRIVATE_RATE              = 4050; // 35% bonus, 2018-04-20 - 2018-05-20
  uint public constant  ROUND1_RATE              = 3750; // 25% bonus, 2018-05-21 - 2018-05-26
  uint public constant  ROUND2_RATE              = 3450; // 15% bonus, 2018-05-26 - 2018-05-31
  uint public constant  ROUND3_RATE              = 3150; //  5% bonus, 2018-05-31 - 2018-06-05
  */


  before(async () => {
    tokenInstance = await OriginSportToken.new(owner, publicSaleEndTime, {from: owner})
    saleInstance  = await OriginSportTokenSale.new(publicSaleStartTime, publicSaleEndTime, tokenInstance.address, wallet)
    await tokenInstance.transfer(saleInstance.address, tokenForPublicSale, {from: owner})
  })

  it("should be able to send tokens to user from crowdsale allowance", async function() {
      let allowance = (await tokenInstance.allowance(owner, saleInstance.address)).toNumber();
      await saleInstance.testTransferTokens(user1, allowance);

      // user has received all the tokens
      let user1Balance = (await tokenInstance.balanceOf(user1)).toNumber();
      assert.equal(user1Balance, allowance, "The user should have received all the tokens");

      // crowdsale allowance is now 0
      allowance = (await tokenInstance.allowance(owner, saleInstance.address)).toNumber();
      assert.equal(allowance, 0, "The crowdsale should have an allowance of 0");
  });

  it("test transfer 2 ether to participant token sale", async function() {
      let crowdSaleAllowance = (await tokenInstance.crowdSaleSupply()).toNumber();
      await tokenInstance.setCrowdsale(saleInstance.address, crowdSaleAllowance); 
      let tokenOwner = await tokenInstance.owner();

      var amountEther = 2;
      var amountWei = web3.toWei(amountEther, "ether");

      let allowance = (await tokenInstance.allowance(tokenOwner, saleInstance.address)).toNumber();
      assert.equal(allowance, crowdSaleAllowance, "The allowance should be equal to the crowdsale allowance");

      await saleInstance.sendTransaction({from: user2,  value: web3.toWei(amountEther, "ether")});

      let allowanceAfter = (await tokenInstance.allowance(tokenOwner, saleInstance.address)).toNumber();
      let user2BalanceAfter = (await tokenInstance.balanceOf(user2)).toNumber();
      let ownerBalanceAfter = (await tokenInstance.balanceOf(tokenOwner)).toNumber();

      assert.equal(allowance - (amountWei * rate), ownerBalanceAfter, "The crowdsale should have sent amountWei*rate");
      assert.equal(user2BalanceAfter, amountWei * rate, "The user should have gained amountWei*rate");
      assert.equal(allowanceAfter + user2BalanceAfter, crowdSaleAllowance, "The total tokens should remain the same");
  });

});


