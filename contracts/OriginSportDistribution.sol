pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './OriginSportToken.sol';

contract OriginSportDistribution is Ownable {
  using SafeMath for uint;

  uint public constant decimal = 10**uint(18);

  uint public constant INITIAL_SUPPLY   = 300000000 * decimal;
  uint public AVAILABLE_TOTAL_SUPPLY    = 300000000 * decimal;
  uint public AVAILABLE_PUBLIC_SUPPLY   = 135000000 * decimal; // 45%
  uint public AVAILABLE_PRESALE_SUPPLY  =  45000000 * decimal; // 15%

  uint public RATE                      = 3000;
  uint public ROUND1_RATE               = 3750; // 2018-05-20
  uint public ROUND2_RATE               = 3450; // 2018-05-25
  uint public ROUND3_RATE               = 3150; // 2018-05-31

  uint public minContribution = 5 * 10**uint(17);
  uint public amountRaised;
  uint public startTime;
  uint public endTime;
  bool public saleClosed;

  OriginSportToken public ORS;

  // Modifiers
  modifier beforeDeadline()   { require (currentTime() < endTime); _; }
  modifier afterStartTime()   { require (currentTime() >= startTime); _; }
  modifier saleNotClosed()    { require (!saleClosed); _; }

  // Events
  event GoalReached(address addr, uint _amountRaised);
  event CapReached(address addr, uint _amountRaised);
  event LogContribute(address addr, uint _amount);


  function OriginSportDistribution(uint _startTime) public {
    require(_startTime >= now);

    startTime = _startTime;
    endTime = startTime + 15 * 24 * 60 * 1 minutes;

    ORS = OriginSportToken(this);
  }

  function () payable afterStartTime beforeDeadline saleNotClosed public {
    require(msg.value >= minContribution);

    uint amount = msg.value;
    amountRaised = amountRaised.add(amount);

    uint rate = getRate();
    uint orsAmount = amount.mul(rate);

    if (ORS.transferFrom(ORS.owner(), msg.sender, orsAmount)) {
      LogContribute(msg.sender, amount);
    }
    else {
      revert();
    }
  }

  function getRate() constant public returns (uint _rate) {
    return ROUND1_RATE;
  }

  function currentTime() constant public returns (uint _currentTime) {
    return now;
  }
}




