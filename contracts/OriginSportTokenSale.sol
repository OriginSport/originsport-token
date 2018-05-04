pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './OriginSportToken.sol';

contract OriginSportTokenSale is Pausable {
  using SafeMath for uint;

  // Constant
  uint public constant decimal = 18;
  uint public constant MINIMAL_CONTRIBUTION      = 2 * 10 ** uint(decimal-1);

  uint public constant GOAL                      = 18000 ether;
  uint public constant HARD_CAP                  = 30000 ether;

  uint public constant    BASE_RATE              = 3000;
  uint public constant PRIVATE_RATE              = 4050; // 35% bonus, 2018-04-20 - 2018-05-20
  uint public constant  ROUND1_RATE              = 3750; // 25% bonus, 2018-05-21 - 2018-05-26
  uint public constant  ROUND2_RATE              = 3450; // 15% bonus, 2018-05-26 - 2018-05-31
  uint public constant  ROUND3_RATE              = 3150; //  5% bonus, 2018-05-31 - 2018-06-05

  // Properties
  uint public tokenSold;
  uint public weiRaised;
  uint public startTime;
  uint public endTime;
  bool public finalized;
  address public wallet;

  OriginSportToken public token;

  // Modifiers
  modifier inProgress() { require (now < endTime && now >= startTime); _; }

  // Events
  event LogContribute(address indexed addr, uint etherAmount, uint orsAmount);
  event Finalized(uint tokenSold, uint weiRaised);

  /**
   * @dev The construct function of tokensale
   * @param _endTime - _startTime must greater than 10 days
   *        because these are three rounds, each round interval is 5 days
   */
  function OriginSportTokenSale(uint _startTime, uint _endTime, address _token, address _wallet) public {
    require(_endTime > _startTime + 10 days);
    require(_startTime >= now);
    startTime = _startTime;
    endTime = _endTime;
    token = OriginSportToken(_token);
    wallet = _wallet;
  }

  /**
   * @dev This function allows token to be purchased by directly
   * sending ether to this smart contract.
   */
  function () payable whenNotPaused external {
    buyTokens(msg.sender);
  }

  /**
   * @dev low level token purchase 
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) payable whenNotPaused inProgress public {
    require(msg.value >= MINIMAL_CONTRIBUTION);
    require(!hardCapReached());

    uint rate = getRate();
    uint orsAmount = msg.value.mul(rate);

    token.transfer(_beneficiary, orsAmount);
    forwardFunds();

    weiRaised = weiRaised.add(msg.value);
    tokenSold = tokenSold.add(orsAmount);
    LogContribute(_beneficiary, msg.value, orsAmount);

    if (weiRaised > HARD_CAP) {
      finalizeSale();
    }
  }

  /**
   * @dev indicate the address to store ETH
   */
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  /**
   * @dev get real rate with the time contributor transfer ether
   *
   */
  function getRate() public view returns (uint _rate) {
    if (now < startTime + 5 days) {
      return ROUND1_RATE;
    } else if (now >= startTime + 5 days && now < startTime + 10 days) {
      return ROUND2_RATE;
    } else {
      return ROUND3_RATE;
    }
  }

  /**
   * @dev return true if the hard cap is reached.
   */
  function hardCapReached() public view returns (bool) {
    return weiRaised >= HARD_CAP;
  }

  /**
   * @dev execute the finalization process
   */
  function endSale() whenNotPaused public {
    require(!finalized);
    require(now > endTime);
    finalizeSale();
  }

  /**
   * @dev finalize the token sale
   */
  function finalizeSale() internal {
    finalized = true;
    Finalized(tokenSold, weiRaised);
  }
}
