const web3 = require('web3')

const OriginSportToken = artifacts.require('./OriginSportToken.sol')
const OriginSportTokenSale = artifacts.require('./OriginSportTokenSale.sol')

contract('OriginSportTokenSale Test', function(accounts) {
  var owner = accounts[0]
  var user1 = accounts[1]
  var user2 = accounts[2]
  var user3 = accounts[3]

  before(function() {
    return OriginSportTokenSale.deployed().then(function(instance) {
        saleInstance = instance
        return OriginSportToken.deployed()
    }).then(function(instance){
      tokenInstance = instance
      return tokenInstance.totalSupply()
    })
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


