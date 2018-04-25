pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract OriginSportToken is StandardToken, Ownable, BurnableToken {
  using SafeMath for uint;

  // Events
  event Burn(address indexed _burner, uint _value);

  // Constants
  string public constant name           = 'Origin Sport Token';
  string public constant symbol         = 'ORS';
  uint   public constant decimal        = 18;
  uint   public constant INITIAL_SUPPLY = 300000000 * 10 ** uint(decimal);

  // Properties
  uint public transferableStartTime;
  address public  tokenSaleContract;

  // Filter invalid address
  modifier validAddress(address addr) {
    require(addr != address(0x0));
    require(addr != address(this));
    _;
  }

  modifier onlyWhenTransferEnabled() {
    if (now < transferableStartTime) {
      require(msg.sender == tokenSaleContract || msg.sender == owner);
    }
    _;
  }

  /**
   * @dev Constructor for Origin Sport Token, assigns the total supply to admin address 
   * @param _transferableStartTime the time ors can transfer
   * @param _admin the admin address of ors
   */
  function OriginSportToken(uint _transferableStartTime, address _admin) public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = totalSupply_;
    Transfer(address(0x0), msg.sender, totalSupply_);

    transferableStartTime = _transferableStartTime;
    tokenSaleContract = msg.sender;

    transferOwnership(_admin);
  }

  /**
   * @dev overrides transfer function with modifier to prevent from transfer with invalid address
   * @param _to The address to transfer to
   * @param _value The amount to be transferred
   */
  function transfer(address _to, uint _value) public 
    validAddress(_to) 
    onlyWhenTransferEnabled 
    returns (bool) 
  {
    return super.transfer(_to, _value);
  }

  /**
   * @dev overrides transfer function with modifier to prevent from transfer with invalid address
   * @param _from The address to transfer from.
   * @param _to The address to transfer to.
   * @param _value The amount to be transferred.
   */
  function transferFrom(address _from, address _to, uint _value) public 
    validAddress(_to) 
    onlyWhenTransferEnabled 
    returns (bool) 
  {
    return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev overrides burn function with modifier to prevent burn while untransferable
   * @param _value The amount to be burned.
   */
  function burn(uint _value) public onlyWhenTransferEnabled {
    super.burn(_value);
  }
}
