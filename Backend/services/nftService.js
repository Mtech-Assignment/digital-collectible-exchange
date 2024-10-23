const { ethers } = require('ethers');
const nftContractABI = require('../abi/NFT.json');
const mktplaceContractABI = require('../abi/NFTMarketplace.json');
const csdpTokenABI = require('../abi/CSDP.json');

// Connect to the blockchain (e.g., using Infura, Alchemy, or a local node)
const provider = new ethers.JsonRpcProvider(process.env.rpcProviderUrl);

// Create a new instance of the contract
const nftContract = new ethers.Contract(process.env.nftAddress, nftContractABI.abi, provider);
const marketplaceContract = new ethers.Contract(process.env.nftMarketplaceAddress, mktplaceContractABI.abi, provider);
const csdpTokenContract = new ethers.Contract(process.env.csdpAddress, csdpTokenABI.abi, provider);


module.exports = {
    mintNFT: async function(tokenURI, userWallet) {
        // Create a wallet instance using the private key
        const wallet = new ethers.Wallet(userWallet.privateKey, provider);
        const contractWithSigner = nftContract.connect(wallet); // Connect the contract to the wallet
    
        // Call the mint function without specifying the user address
        const tx = await contractWithSigner.mintToken(tokenURI);
        await tx.wait(); // Wait for the transaction to be mined
        return tx;
    },
    
    buyNFT: async function(nftId, buyerWallet) {
        const wallet = new ethers.Wallet(buyerWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);

        const tx = await contractWithSigner.buy(nftId); // Replace with your contract's buy function
        await tx.wait(); // Wait for the transaction to be mined
        return tx;
    },

    sellNFT: async function(nftId, sellerWallet) {
        const wallet = new ethers.Wallet(sellerWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);

        const tx = await contractWithSigner.sell(nftId); // Replace with your contract's sell function
        await tx.wait(); // Wait for the transaction to be mined
        return tx;
    },

    listNFTs: async function(ownerAddress) {
        const balance = await nftContract.balanceOf(ownerAddress);
        const nfts = [];

        for (let i = 0; i < balance.toNumber(); i++) {
            const nftId = await marketplaceContract.tokenOfOwnerByIndex(ownerAddress, i);
            const tokenURI = await marketplaceContract.tokenURI(nftId);
            nfts.push({ id: nftId.toString(), tokenURI });
        }

        return nfts;
    }
};
