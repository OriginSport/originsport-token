pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract OriginSportToken is StandardToken, Ownable {
  using SafeMath for uint;

  // Events
  event Burn(address indexed _burner, uint _value);

  // Constants
  string public name                = 'Origin Sport Token';
  string public symbol              = 'ORS';
  uint public constant decimal      = 18;

  // Properties
  uint public totalSupply           = 300000000 * 10 ** uint(decimal);
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
    balances[msg.sender] = totalSupply;
    Transfer(address(0x0), msg.sender, totalSupply);

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
   * @dev burn tokens
   * @param _value The amount to be burned.
   * @return always true (necessary in case of override)
   */
  function burn(uint _value) public onlyWhenTransferEnabled returns (bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    totalSupply = totalSupply.sub(_value);
    Burn(msg.sender, _value);
    Transfer(msg.sender, address(0x0), _value);
    return true;
  }

  /**
   * @dev burn tokens in the behalf of someone
   * @param _from The address of the owner of the token.
   * @param _value The amount to be burned.
   * @return always true (necessary in case of override)
   */
  function burnFrom(address _from, uint _value) public onlyWhenTransferEnabled returns(bool) {
    require(transferFrom(_from, msg.sender, _value));
    return burn(_value);
  }

  /**
   * @dev transfer to owner any tokens send by mistake on this contracts
   * @param token The address of the token to transfer.
   * @param amount The amount to be transfered.
   */
  function emergencyERC20Drain(ERC20 token, uint amount) public onlyOwner {
    token.transfer(owner, amount);
  }
}
