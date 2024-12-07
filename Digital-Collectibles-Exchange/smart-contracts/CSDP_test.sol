// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;


import "remix_tests.sol"; // Importing the Remix testing library
import "../contracts/CSDP.sol"; // Importing the contract to test

contract CSDPTest {
    CSDP csdp;

    // Setting up before all tests
    function beforeAll() public {
        csdp = new CSDP();
    }

    // Test token initialization
    function testTokenInitialization() public {
        Assert.equal(csdp.name(), "CSDP", "Token name did not match");
        Assert.equal(csdp.symbol(), "CSDP", "Token symbol did not match");
        Assert.equal(csdp.decimals(), 18, "Token decimals should be 18");
        Assert.equal(csdp.tokenPrice(), 1, "Initial token price should be 1 wei");
    }

    // Test owner balance after deployment
    function testOwnerInitialBalance() public {
        uint256 expectedBalance = 100000 * (10 ** uint256(csdp.decimals()));
        Assert.equal(csdp.balanceOf(address(this)), expectedBalance, "Owner's initial balance is incorrect");
    }

    // Test setting token price (positive case)
    function testSetTokenPricePositive() public {
        uint256 newPrice = 2;
        csdp.setTokenPrice(newPrice);
        Assert.equal(csdp.tokenPrice(), newPrice, "Token price did not update correctly");
    }

    // Test setting token price (negative case)
    function testSetTokenPriceNegative() public {
        (bool success, ) = address(csdp).call(abi.encodeWithSignature("setTokenPrice(uint256)", 5));
        Assert.ok(!success, "Non-owner should not be able to set token price");
    }

    // Test minting tokens (positive case)
    function testMintTokensPositive() public payable {
        uint256 initialBalance = csdp.balanceOf(address(this));
        uint256 amountToSend = 1 ether; // Sending 1 Ether
        uint256 tokensToMint = amountToSend / csdp.tokenPrice() * 1000;

        (bool success, ) = address(csdp).call{value: amountToSend}(abi.encodeWithSignature("sendToken()"));
        Assert.ok(success, "Minting tokens should succeed");

        uint256 newBalance = csdp.balanceOf(address(this));
        Assert.equal(newBalance, initialBalance + tokensToMint, "Token balance did not update correctly");
    }

    // Test minting tokens (negative case: no Ether sent)
    function testMintTokensNegative() public {
        (bool success, ) = address(csdp).call(abi.encodeWithSignature("sendToken()"));
        Assert.ok(!success, "Minting tokens should fail without sending Ether");
    }

    // Test withdrawing Ether (positive case)
    function testWithdrawEtherPositive() public {
        uint256 initialContractBalance = address(csdp).balance;
        uint256 ownerBalanceBefore = address(this).balance;

        csdp.withdraw();
        uint256 ownerBalanceAfter = address(this).balance;

        Assert.equal(ownerBalanceAfter, ownerBalanceBefore + initialContractBalance, "Ether withdrawal failed");
    }

    // Test withdrawing Ether (negative case: non-owner)
    function testWithdrawEtherNegative() public {
        (bool success, ) = address(csdp).call(abi.encodeWithSignature("withdraw()"));
        Assert.ok(!success, "Non-owner should not be able to withdraw Ether");
    }

    // Test token transfer (positive case)
    function testTransferTokensPositive() public {
        address recipient = address(0x123);
        uint256 transferAmount = 100 * (10 ** uint256(csdp.decimals()));

        uint256 initialSenderBalance = csdp.balanceOf(address(this));
        uint256 initialRecipientBalance = csdp.balanceOf(recipient);

        csdp.transfer(recipient, transferAmount);

        uint256 finalSenderBalance = csdp.balanceOf(address(this));
        uint256 finalRecipientBalance = csdp.balanceOf(recipient);

        Assert.equal(finalSenderBalance, initialSenderBalance - transferAmount, "Sender's balance did not decrease correctly");
        Assert.equal(finalRecipientBalance, initialRecipientBalance + transferAmount, "Recipient's balance did not increase correctly");
    }

    // Test token transfer (negative case: insufficient balance)
    function testTransferTokensNegative() public {
        address recipient = address(0x456);
        uint256 transferAmount = 1000000 * (10 ** uint256(csdp.decimals())); // Exceeds balance

        (bool success, ) = address(csdp).call(abi.encodeWithSignature("transfer(address,uint256)", recipient, transferAmount));
        Assert.ok(!success, "Transfer should fail for insufficient balance");
    }
}
