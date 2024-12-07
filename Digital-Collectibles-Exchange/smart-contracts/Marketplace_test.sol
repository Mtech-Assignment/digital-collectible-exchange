// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../contracts/Marketplace.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC721 is ERC721 {
    constructor() ERC721("MockNFT", "MNFT") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

contract MockERC20 is ERC20 {
    constructor() ERC20("MockToken", "MTK") {
        _mint(msg.sender, 10000 * (10 ** decimals()));
    }

    function approveContract(address _contract, uint256 amount) external {
        _approve(msg.sender, _contract, amount);
    }
}

contract NFTMarketplaceTest {
    NFTMarketplace marketplace;
    MockERC721 mockNFT;
    MockERC20 mockToken;

    function beforeAll() public {
        mockNFT = new MockERC721();
        mockToken = new MockERC20();
        marketplace = new NFTMarketplace(address(mockToken));

        // Mint a token to the test contract
        mockNFT.mint(address(this), 1);

        // Approve marketplace for listing price and token price
        mockToken.approveContract(address(marketplace), 100 ether);
    }

    function testListingPositive() public {
        // Approve NFT for transfer
        mockNFT.approve(address(marketplace), 1);

        // List item
        marketplace.listItem(address(mockNFT), 1, 1 ether);

        // Fetch listed item
        NFTMarketplace.Item memory item = marketplace.getParticularItem(1);
        Assert.equal(item.tokenId, 1, "Token ID should match");
        Assert.equal(item.seller, address(this), "Seller should match");
    }

    function testListingNegativeZeroPrice() public {
        try marketplace.listItem(address(mockNFT), 1, 0) {
            Assert.ok(false, "Expected error for zero price");
        } catch Error(string memory reason) {
            Assert.equal(reason, "Item Price is zero", "Unexpected error message");
        }
    }

    function testBuyingPositive() public {
        // Buy the listed item
        marketplace.buyItem(address(mockNFT), 1);

        // Verify the ownership transfer
        Assert.equal(mockNFT.ownerOf(1), address(this), "Buyer should own the NFT");
    }

    function testBuyingNegativeNotEnoughApproval() public {
        // Reset the token's approval
        mockToken.approveContract(address(marketplace), 0);

        try marketplace.buyItem(address(mockNFT), 1) {
            Assert.ok(false, "Expected error for insufficient token approval");
        } catch Error(string memory reason) {
            Assert.equal(reason, "Listing Price is not met", "Unexpected error message");
        }
    }

    function testResellPositive() public {
        // Approve NFT for transfer
        mockNFT.approve(address(marketplace), 1);

        // Resell the item
        marketplace.resellItem(address(mockNFT), 1, 2 ether);

        // Verify updated details
        NFTMarketplace.Item memory item = marketplace.getParticularItem(1);
        Assert.equal(item.price, 2 ether, "Price should match updated value");
        Assert.equal(item.owner, address(marketplace), "Marketplace should own the NFT after resell");
    }

    function testResellNegativeNotOwner() public {
        // Try reselling an item not owned
        try marketplace.resellItem(address(mockNFT), 2, 1 ether) {
            Assert.ok(false, "Expected error for unauthorized resell");
        } catch Error(string memory reason) {
            Assert.equal(reason, "You are not the owner of this item", "Unexpected error message");
        }
    }

    function testUnlistingPositive() public {
        marketplace.unlistItem(1);
        try marketplace.getParticularItem(1) {
            Assert.ok(false, "Expected item to be deleted");
        } catch {}
    }

    function testUnlistingNegativeNotOwner() public {
        try marketplace.unlistItem(2) {
            Assert.ok(false, "Expected error for unlisting by non-owner");
        } catch Error(string memory reason) {
            Assert.equal(reason, "You are not the owner of this item", "Unexpected error message");
        }
    }
}
