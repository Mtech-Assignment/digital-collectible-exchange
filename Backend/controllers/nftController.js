const { PinataSDK } = require('pinata-web3');
const nftService = require('../services/nftService');
const walletService = require('../services/walletService');
const { decryptMnemonic } = require('../utils/encrypt');
const User = require('../models/User');
const fs = require('fs');
const { Blob } = require("buffer");
require('dotenv').config();

// Mint an NFT
exports.mintNFT = async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    const pinata = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT
    });
    const pinataGateway = process.env.PINATA_GATEWAY;

    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log("Minting NFT from user: "+ JSON.stringify(user));
        
        // Decrypt the mnemonic for recovery purposes
        const decryptedMnemonic = decryptMnemonic(user.mnemonic);
        console.log("Decrypted Mnemonic: "+decryptedMnemonic);

        // Create wallet from decrypted mnemonic
        const wallet = await walletService.getWalletFromMnemonic(decryptedMnemonic);
        console.log("Minting NFT with user wallet: "+JSON.stringify(wallet));
        const blob = new Blob([fs.readFileSync(req.file.path)]);

        // upload a file to ipfs
        const uploadedFileResponse = await pinata.upload.file(blob);

        console.log("File uploading response: "+JSON.stringify(uploadedFileResponse));
        const fileUploadUrl = `https://${pinataGateway}/ipfs/${uploadedFileResponse.IpfsHash}`;

        const { name, price, description } = req.body;
        if (!name || !price || !description || !fileUploadUrl) {
            console.log("Some field are missing");
            return res.status(404).json({ success: false, message: `Some field of NFT not found` });;
        }

        const uploadedJsonResponse = await pinata.upload.json({ name, description, price, image: fileUploadUrl });
        const tokenURI = `https://${pinataGateway}/ipfs/${uploadedJsonResponse.IpfsHash}`;

        const tx = await nftService.mintNFT(tokenURI, wallet);
        const tokenId = await tx.wait();
        console.log("The new minted token id is : "+JSON.stringify(tokenId));
        res.status(201).json({ success: true, transaction: tx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buy an NFT
exports.buyNFT = async (req, res) => {
    const { nftId } = req.params;
    const buyerWallet = req.user.wallet; // Assume wallet details are stored in user object

    try {
        const tx = await nftService.buyNFT(nftId, buyerWallet);
        res.status(200).json({ success: true, transaction: tx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sell an NFT
exports.sellNFT = async (req, res) => {
    const { nftId } = req.params;
    const sellerWallet = req.user.wallet; // Assume wallet details are stored in user object

    try {
        const tx = await nftService.sellNFT(nftId, sellerWallet);
        res.status(200).json({ success: true, transaction: tx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// List all NFTs for a user
exports.listNFTs = async (req, res) => {
    const userWallet = req.user.wallet; // Assume wallet details are stored in user object

    try {
        const nfts = await nftService.listNFTs(userWallet.address);
        res.status(200).json({ success: true, nfts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
