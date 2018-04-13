pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract OriginSportToken is StandardToken, Ownable {
  using SafeMath for uint;

  // Constants
  string public name   = 'OriginSport';
  string public symbol = 'ORS';
  uint public constant decimal = 10**uint(18);
  uint public constant TOTAL_SUPPLY        = 300000000 * decimal;
  uint public constant CROWDSALE_ALLOWANCE = 180000000 * decimal;
  uint public constant ADMIN_ALLOWANCE     = 120000000 * decimal;

  // Properties
  uint public crowdSaleAllowance;      // the number of tokens available for crowdsales
  uint public adminAllowance;          // the number of tokens available for the administrator
  address public crowdSaleAddr;           // the address of a crowdsale currently selling this token
  address public adminAddr;               // the address of a crowdsale currently selling this token


  // Filter invalid address
  modifier validAddress(address addr) {
    require(addr != address(0x0));
    require(addr != address(this));
    require(addr != owner);
    require(addr != address(adminAddr));
    require(addr != address(crowdSaleAddr));
    _;
  }

  /**
   * @dev Constructor for Origin Sport token
   * @dev Assigns the total supply to admin address 
   */
  function OriginSportToken(address addr) public {
    balances[addr] = TOTAL_SUPPLY;
  }

  /**
   * Overrides transfer function with modifier to prevents
   * from transfer with invalid address
   */
  function transfer(address _to, uint _value) public validAddress(_to) returns (bool) {
    return super.transfer(_to, _value);
  }

  /**
   * Overrides transferFrom function with modifier to prevents
   * from transfer with invalid address
   */
  function transferFrom(address _from, address _to, uint _value) public validAddress(_to) returns (bool) {
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    bool result = super.transferFrom(_from, _to, _value);
    if (result) {
      balances[_from] = balances[_from].sub(_value);
      balances[_to] = balances[_to].add(_value);
      allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    }
    return result;
  }
}
