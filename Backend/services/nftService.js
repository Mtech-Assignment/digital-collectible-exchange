const { ethers } = require('ethers');
const nftContractABI = require('../abi/NFT.json');
const mktplaceContractABI = require('../abi/NFTMarketplace.json');
const csdpTokenABI = require('../abi/CSDP.json');
const { mapNftItemToObject } = require('../utils/nft');

// Connect to the blockchain (e.g., using Infura, Alchemy, or a local node)
const provider = new ethers.JsonRpcProvider(process.env.rpcProviderUrl);

// Create a new instance of the contract
const nftContract = new ethers.Contract(process.env.nftAddress, nftContractABI.abi, provider);
const marketplaceContract = new ethers.Contract(process.env.nftMarketplaceAddress, mktplaceContractABI.abi, provider);
const csdpTokenContract = new ethers.Contract(process.env.csdpAddress, csdpTokenABI.abi, provider);


async function approveToken(amount, wallet) {
    const contractWithSigner = csdpTokenContract.connect(wallet); // Connect the contract to the wallet
    const convertedPrice = ethers.parseUnits(amount.toString(), 18);
    const csdpApprovalTxn = await contractWithSigner.approve(
        process.env.nftMarketplaceAddress,
        convertedPrice
    );
    await csdpApprovalTxn.wait(); // Wait for the transaction to be mined
}

async function getMarketplaceListingPrice(wallet) {
    const contractWithSigner = marketplaceContract.connect(wallet);
    const listingPriceTxn = await contractWithSigner.getListingPrice();
    return listingPriceTxn;
}

async function getParticularMarketplaceItem(itemId, wallet) {
    const contractWithSigner = marketplaceContract.connect(wallet);
    const mktplaceItem = await contractWithSigner.getParticularItem(itemId);
    console.log("Getting particular marketplace item with id : "+ itemId);
    console.log();
    return mktplaceItem;
}

exports.getUserListedNFTs = async (userWallet) => {
    try {
        const wallet = new ethers.Wallet(userWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);
        let nftListedByUser = await contractWithSigner.getSellerListedItems();
        userOwnedNFTs = mapNftItemToObject(userOwnedNFTs);
        console.log("User Owned NFT on marketplace : ", userOwnedNFTs);
        console.log();
        return { listed_nfts: nftListedByUser };
    } catch (error) {
        throw new Error(error);
    }
}

exports.getAllListedNFTs = async function() {
    try {
        let allListedNftOnMarketplace = await marketplaceContract.getAllListedItems();
        allListedNftOnMarketplace = mapNftItemToObject(allListedNftOnMarketplace);
        console.log("Listed NFT on marketplace : ", allListedNftOnMarketplace);
        console.log();
        return { listed_nft_items: allListedNftOnMarketplace };
    } catch (error) {
        throw new Error(error);
    }
}

exports.getUserOwnedNFTs = async function(userWallet) {
    try {
        const wallet = new ethers.Wallet(userWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);
        let userOwnedNFTs = await contractWithSigner.getOwnerListedItems();
        userOwnedNFTs = mapNftItemToObject(userOwnedNFTs);
        console.log("User Owned NFT on marketplace : ", userOwnedNFTs);
        console.log();
        return { owned_nft_items: userOwnedNFTs };
    } catch (error) {
        throw new Error(error);
    }
}

exports.mintNFT = async function(tokenURI, userWallet) {
    try {
        // Create a wallet instance using the private key
        const wallet = new ethers.Wallet(userWallet.privateKey, provider);
        const contractWithSigner = nftContract.connect(wallet); // Connect the contract to the wallet
        let tokenId = null;

        const eventPromise = new Promise((resolve, _) => {
            nftContract.once('Transfer', (_, to, tokenId) => {
                resolve(tokenId);
            });
        });
        
        // Call the mint function without specifying the user address
        const tx = await contractWithSigner.mintToken(tokenURI);
        await tx.wait(); // Wait for the transaction to be mined
        
        tokenId = Number(await eventPromise);
        return { nft_minted: true, tokenid: tokenId };
    } catch (error) {
        throw new Error(error);
    }
};

exports.listNFT = async function(nftId, listingPrice, listerWallet) {
    try {
        const wallet = new ethers.Wallet(listerWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);
        const mktplaceListingPrice = await getMarketplaceListingPrice(wallet);
        console.log("Marketplace Listing price of NFT is : " + mktplaceListingPrice);
        console.log();

        await approveToken(mktplaceListingPrice, wallet);

        const eventPromise = new Promise((resolve, _) => {
            marketplaceContract.once('ItemList', (mktPlaceItemId) => {
                resolve(mktPlaceItemId);
            });
        });

        const listNFTTx = await contractWithSigner.listItem(
            process.env.nftAddress,
            nftId,
            ethers.parseUnits(listingPrice.toString(), 18)
        );
        await listNFTTx.wait();

        let marketplaceItemId = Number(await eventPromise);
        return { nft_listed: true, listed_itemid: marketplaceItemId };
    } catch (error) {
        throw new Error(error);
    }
};

exports.buyNFT = async function(marketplaceItemId, buyerWallet) {
    console.log("marketplaceItemId ", marketplaceItemId);
    try {
        const wallet = new ethers.Wallet(buyerWallet.privateKey, provider);
        const contractWithSigner = marketplaceContract.connect(wallet);
        const marketplaceItem = await getParticularMarketplaceItem(marketplaceItemId, wallet);
        
        await approveToken(marketplaceItem.price, wallet);
        console.log("Token CSDP Approved for buying NFT with price "+marketplaceItem.price+" CSDP");
        console.log();

        const tx = await contractWithSigner.buyItem(process.env.nftAddress, marketplaceItemId);
        await tx.wait(); // Wait for the transaction to be mined
        return { nft_bought: true };
    } catch (error) {
        throw new Error(error);
    }
};

exports.resellNFT = async function(nftId, resellPrice, resellerWallet) {
    try {
        const wallet = new ethers.Wallet(resellerWallet.privateKey, provider);
        const mktPlaceContractWithSigner = marketplaceContract.connect(wallet);
        const nftContractWithSigner = nftContract.connect(wallet);
        const mktplaceListingPrice = await getMarketplaceListingPrice(wallet);
        console.log("Marketplace Listing price of NFT is : " + mktplaceListingPrice);
        console.log();

        await approveToken(mktplaceListingPrice, wallet);
        console.log("CSDP Token amount for relisting is approved for Marketplace");
        console.log();

        const nftApprovalToMarketplace = await nftContractWithSigner.approve(process.env.nftMarketplaceAddress, nftId);
        await nftApprovalToMarketplace.wait();
        console.log("NFT Approval to marketplace for relisting done successfully");
        console.log();

        const resellItemTx = await mktPlaceContractWithSigner.resellItem(
            process.env.nftAddress,
            nftId,
            ethers.parseUnits(resellPrice.toString(), 18)
        );
        await resellItemTx.wait();

        return { item_listed: true };
    } catch (error) {
        throw new Error(error);
    }
};

// exports.getUserListedNFTs = async function() {
//     const balance = await nftContract.balanceOf(ownerAddress);
//     const nfts = [];

//     for (let i = 0; i < balance.toNumber(); i++) {
//         const nftId = await marketplaceContract.tokenOfOwnerByIndex(ownerAddress, i);
//         const tokenURI = await marketplaceContract.tokenURI(nftId);
//         nfts.push({ id: nftId.toString(), tokenURI });
//     }

//     return nfts;
// };
