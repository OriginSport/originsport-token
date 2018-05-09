pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './OriginSportToken.sol';

contract Airdrop is Ownable {
  using SafeMath for uint;

  OriginSportToken public token;

  function Airdrop(address _token) public {
    token = OriginSportToken(_token);
  }

  /**
   * @dev airdrop ors to community users
   * @param recipients the user list 
   * @param amount airdrop amount of ors
   */
  function airdrop(address[] recipients, uint amount) onlyOwner public {

    //require(recipients.length.mul(amount) < token.balanceOf(address(this)));

    for(uint i = 0; i < recipients.length; i++) {
      token.transfer(recipients[i], amount);
    }
  }
}
