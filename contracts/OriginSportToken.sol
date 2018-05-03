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
  bool public transferable = false;
  mapping (address => bool) public whitelistedTransfer;

  // Filter invalid address
  modifier validAddress(address addr) {
    require(addr != address(0x0));
    require(addr != address(this));
    _;
  }

  modifier onlyWhenTransferable() {
    if (!transferable) {
      require(whitelistedTransfer[msg.sender]);
    }
    _;
  }

  /**
   * @dev Constructor for Origin Sport Token, assigns the total supply to admin address 
   * @param admin the admin address of ors
   */
  function OriginSportToken(address admin) validAddress(admin) public {
    require(msg.sender != admin);
    whitelistedTransfer[admin] = true;
    totalSupply_ = INITIAL_SUPPLY;
    balances[admin] = totalSupply_;
    Transfer(address(0x0), admin, totalSupply_);

    transferOwnership(admin);
  }

  /**
   * @dev allow owner to add addresse to transfer tokens
   * @param _address address Address to be added
   */
  function addWhitelistedTransfer(address _address) onlyOwner public {
    whitelistedTransfer[_address] = true;
  }

  /**
   * @dev allow all users to transfer tokens
   */
  function activeTransfer() onlyOwner public {
    transferable = true;
  }

  /**
   * @dev overrides transfer function with modifier to prevent from transfer with invalid address
   * @param _to The address to transfer to
   * @param _value The amount to be transferred
   */
  function transfer(address _to, uint _value) public 
    validAddress(_to) 
    onlyWhenTransferable
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
    onlyWhenTransferable
    returns (bool) 
  {
    return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev overrides burn function with modifier to prevent burn while untransferable
   * @param _value The amount to be burned.
   */
  function burn(uint _value) public onlyWhenTransferable onlyOwner {
    super.burn(_value);
  }
}
