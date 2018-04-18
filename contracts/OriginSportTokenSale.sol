pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './OriginSportToken.sol';

contract OriginSportTokenSale is Ownable{
  using SafeMath for uint;

  // Constant
  uint public constant decimal = 18;
  uint public constant AVAILABLE_TOTAL_SUPPLY    = 300000000 * 18 ** uint(decimal);
  uint public constant AVAILABLE_PUBLIC_SUPPLY   = 135000000 * 18 ** uint(decimal); // 45%
  uint public constant AVAILABLE_PRIVATE_SUPPLY  =  45000000 * 18 ** uint(decimal); // 15%
  uint public constant MINIMAL_CONTRIBUTION      =         5 * 10 ** uint(decimal-1);

  uint public constant GOAL                      = 21800 ether;
  uint public constant HARD_CAP                  = 36000 ether;

  uint public constant   BASE_RATE               = 3000;
  uint public constant ROUND1_RATE               = 3750; // 2018-05-15 - 20
  uint public constant ROUND2_RATE               = 3450; // 2018-05-20 - 25
  uint public constant ROUND3_RATE               = 3150; // 2018-05-25 - 30

  // Properties
  uint public amountRaised;
  uint public startTime;
  uint public endTime;
  bool public saleClosed;

  OriginSportToken public token;

  // Modifiers
  modifier beforeDeadline()   { require (now < endTime); _; }
  modifier afterStartTime()   { require (now >= startTime); _; }
  modifier inProgress()       { require (now < endTime && now >= startTime); _; }
  modifier saleNotClosed()    { require (!saleClosed); _; }

  // Events
  event GoalReached(address addr, uint _amountRaised);
  event HardCapReached(address addr, uint _amountRaised);
  event LogContribute(address addr, uint _amount);


  function OriginSportTokenSale(uint _startTime, uint _endTime) public {
    require(_startTime >= now);
    startTime = _startTime;
    endTime = _endTime;
    token = OriginSportToken(this);
  }

  /**
   * @dev This function allows token to be purchased by directly
   * sending ether to this smart contract.
   */
  function () external payable {
    buyTokens(msg.sender);
  }

  /**
   * @dev low level token purchase 
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) public payable inProgress {
    require(msg.value >= MINIMAL_CONTRIBUTION);
    uint amount = msg.value;
    amountRaised = amountRaised.add(amount);
    uint rate = getRate();
    uint orsAmount = amount.mul(rate);
    if (token.transfer(_beneficiary, orsAmount)) {
      LogContribute(_beneficiary, amount);
    } else {
      revert();
    }
  }

  /**
   * @dev get real rate with the time contribute transfer ether
   *
   */
  function getRate() view public returns (uint _rate) {
    if (now < startTime + 5 days) {
      return ROUND1_RATE;
    } else if (now >= startTime + 5 days && now < endTime - 5 days) {
      return ROUND2_RATE;
    } else {
      return ROUND3_RATE;
    }
  }

  /**
   * @dev return true if the hard cap is reached.
   *
   */
  function hardCapReached() view public returns (bool) {
      return amountRaised >= HARD_CAP;
  }
}




