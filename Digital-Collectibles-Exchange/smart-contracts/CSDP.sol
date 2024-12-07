// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CSDP is ERC20, Ownable, ReentrancyGuard {
    uint256 public tokenPrice;

    // to restrict the total supply of CSDP
    uint256 private totalTokenSupply;

    constructor()
        ERC20("CSDP", "CSDP")
        Ownable(msg.sender) // Specify the Ownable constructor
    {
        totalTokenSupply = 100000000 * 10 ** uint(decimals()); // 100 million total supply
        tokenPrice = 1;
        totalTokenSupply -= 100000 * 10 ** uint(decimals());
        _mint(msg.sender, 100000 * 10 ** uint(decimals())); // 1 lakh tokens to the owner
    }

    // This function will be called whenever Ether is sent to the contract
    function sendToken() external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "You must send Ether to get tokens");
        
        uint256 amountToMint = msg.value / tokenPrice * 1000; // currently 1 wei = 10^-15 CSDP (might change in future)
        require(totalTokenSupply > 0, "No more tokens can be minted"); // with this overflow is taken care of 
        
        totalTokenSupply -= amountToMint;
        _mint(msg.sender, amountToMint); // Mint tokens to the sender
        return balanceOf(msg.sender);
    }

    function withdraw() public nonReentrant onlyOwner {
        payable(owner()).transfer(address(this).balance); // Withdraw Ether from the contract
    }

    function setTokenPrice(uint256 newPrice) public onlyOwner {
        tokenPrice = newPrice; // Update the token price
    }
     
    function transfer(address to, uint256 value) override public nonReentrant returns (bool) {
        uint256 burnAmount = value * 2 / 100000; // 0.002% 
        _burn(msg.sender, burnAmount); // burn 0.002% of the token on every txn
        return super.transfer(to, value - burnAmount);
    }
}
