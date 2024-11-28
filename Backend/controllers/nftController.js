const { PinataSDK } = require('pinata-web3');
const nftService = require('../services/nftService');
const walletService = require('../services/walletService');
const { decryptMnemonic } = require('../utils/encrypt');
const User = require('../models/User');
const AsyncJobStatus = require('../models/AsyncJobStatus');
const fs = require('fs');
const { Blob } = require("buffer");
require('dotenv').config();

async function getUserWallet(user) {
    // Decrypt the mnemonic for recovery purposes
    const decryptedMnemonic = decryptMnemonic(user.mnemonic);
    console.log("Decrypted Mnemonic: "+decryptedMnemonic);
    console.log();

    // Create wallet from decrypted mnemonic
    const wallet = await walletService.getWalletFromMnemonic(decryptedMnemonic);
    console.log("Minting NFT with user wallet: "+JSON.stringify(wallet));
    console.log();
    return wallet;
}

function calculateNextWindowTimeInMinutes(lastUpdateTime) {
    const thresholdMins = 5;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const differenceInSeconds = currentTimestamp - lastUpdateTime;
    const differenceInMins = differenceInSeconds / 60;
    
    return thresholdMins - differenceInMins;
}

exports.getListedNFTOnMarketplace = async (req, res) => {
    const { search } = req.query;
    try {
        let listedNftList = await nftService.getAllListedNFTs();

        listedNftList.listed_nft_items = await Promise.all(listedNftList.listed_nft_items.map(async (nft) => {
            const nftDetails = await nftService.getNftDetail(nft.tokenId);
            return { name: nftDetails.nft_info.name, description: nftDetails.nft_info.description, ...nft };
        }));

        if (search) {
            listedNftList.listed_nft_items = listedNftList.listed_nft_items.filter((nft) => {
                return nft.name.toLowerCase().includes(search.toLowerCase()) | nft.description.toLowerCase().includes(search.toLowerCase());
            });
        }

        res.status(200).json({ success: true, listedNftList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getUserOwnedNFTOnMarketplace = async (req, res) => {
    const { userId } = req.params;
    const { search } = req.query;
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user || user.id !== userId) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        const wallet = await getUserWallet(user);

        const userOwnedNfts = await nftService.getUserOwnedNFTs(wallet);

        userOwnedNfts.owned_nft_items = await Promise.all(userOwnedNfts.owned_nft_items.map(async (nft) => {
            const nftDetails = await nftService.getNftDetail(nft.tokenId);
            return { name: nftDetails.nft_info.name, description: nftDetails.nft_info.description, ...nft };
        }));

        if (search) {
            userOwnedNfts.owned_nft_items = userOwnedNfts.owned_nft_items.filter((nft) => {
                return nft.name.toLowerCase().includes(search.toLowerCase()) | nft.description.toLowerCase().includes(search.toLowerCase());
            });
        }
        res.status(200).json({ success: true, userOwnedNfts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getUserListedNFTOnMarketplace = async (req, res) => {
    const { userId } = req.params;
    const { search } = req.query;
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user || userId !== user.id) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        const wallet = await getUserWallet(user);

        let userListedNfts = await nftService.getUserListedNFTs(wallet);

        userListedNfts.listed_nfts = await Promise.all(userListedNfts.listed_nfts.map(async (nft) => {
            const nftDetails = await nftService.getNftDetail(nft.tokenId);
            return { name: nftDetails.nft_info.name, description: nftDetails.nft_info.description, ...nft };
        }));

        if (search) {
            userListedNfts.listed_nfts = userListedNfts.listed_nfts.filter((nft) => {
                return nft.name.toLowerCase().includes(search.toLowerCase()) | nft.description.toLowerCase().includes(search.toLowerCase());
            });
        }
        res.status(200).json({ success: true, listed_nfts: userListedNfts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

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
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Minting NFT from user: "+ JSON.stringify(user));
        console.log();

        const wallet = await getUserWallet(user);
        const blob = new Blob([fs.readFileSync(req.file.path)]);

        // upload a file to ipfs
        const uploadedFileResponse = await pinata.upload.file(blob);

        console.log("File uploading response: "+JSON.stringify(uploadedFileResponse));
        console.log();
        const fileUploadUrl = `https://${pinataGateway}/ipfs/${uploadedFileResponse.IpfsHash}`;

        const { name, price, description } = req.body;
        if (!name || !price || !description || !fileUploadUrl) {
            console.log("Some field are missing");
            console.log();
            return res.status(400).json({ success: false, message: `Some field of NFT not found` });;
        }

        const uploadedJsonResponse = await pinata.upload.json({ name, description, price, image: fileUploadUrl });
        const tokenURI = `https://${pinataGateway}/ipfs/${uploadedJsonResponse.IpfsHash}`;

        const nftTx = await nftService.mintNFT(tokenURI, wallet);

        fs.unlinkSync(req.file.path);  // delete the file as it's processed
        res.status(201).json({ success: true, transaction: nftTx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mint an NFT
exports.mintNFTJob = async (req, res) => {
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
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Minting NFT from user: "+ JSON.stringify(user));
        console.log();

        const wallet = await getUserWallet(user);
        const blob = new Blob([fs.readFileSync(req.file.path)]);

        // upload a file to ipfs
        const uploadedFileResponse = await pinata.upload.file(blob);

        console.log("File uploading response: "+JSON.stringify(uploadedFileResponse));
        console.log();
        const fileUploadUrl = `https://${pinataGateway}/ipfs/${uploadedFileResponse.IpfsHash}`;

        const { name, price, description } = req.body;
        if (!name || !price || !description || !fileUploadUrl) {
            console.log("Some field are missing");
            console.log();
            return res.status(400).json({ success: false, message: `Some field of NFT not found` });;
        }

        const nftMintingTransactionInitiationMessage = 'NFT Minting transaction started successfully.';
        const asyncListJob = new AsyncJobStatus({ user: user.username, status: 'PENDING', message: nftMintingTransactionInitiationMessage });
        await asyncListJob.save();

        const uploadedJsonResponse = await pinata.upload.json({ name, description, price, image: fileUploadUrl });
        const tokenURI = `https://${pinataGateway}/ipfs/${uploadedJsonResponse.IpfsHash}`;

        nftService.mintNFT(tokenURI, wallet)
        .then(async (nftTx) => {
            if (!nftTx.nft_minted) {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'FAILED', message: nftTx.error }
                );
            }
            else {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'DONE', message: `NFT Minted successfully with id as ${nftTx.tokenid}.` }
                );
            }
        })
        .catch(async (err) => {
            await AsyncJobStatus.findByIdAndUpdate(
                asyncListJob._id,
                { status: 'FAILED', message: err }
            );
        });

        fs.unlinkSync(req.file.path);  // delete the file as it's processed
        return res.status(202).json({ success: true, result: {
            id: asyncListJob._id,
            status: 'PENDING',
            message: nftMintingTransactionInitiationMessage
        } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.listNFTOnMarketplace = async (req, res) => {
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Listing NFT from user: "+ JSON.stringify(user));
        console.log();

        const userWallet = await getUserWallet(user);
        let listNFTTxRes = await nftService.listNFT(req.params.nftId, req.body.listingPrice, userWallet);

        if (!listNFTTxRes.nft_listed) {
            return res.status(400).json({ success: false, message: listNFTTxRes.message });
        }
        res.status(201).json({ success: true, transaction: listNFTTxRes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.listNftOnMarketplaceJob = async (req, res) => {
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Listing NFT from user: "+ JSON.stringify(user));
        console.log();

        const userWallet = await getUserWallet(user);
        const listingTransactionInitiationMessage = 'Item listing on marketplace transaction started successfully.';
        const asyncListJob = new AsyncJobStatus({ user: user.username, status: 'PENDING', message: listingTransactionInitiationMessage });
        await asyncListJob.save();

        nftService.listNFT(req.params.nftId, req.body.listingPrice, userWallet)
        .then(async (listNFTTxRes) => {
            if (!listNFTTxRes.nft_listed) {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'FAILED', message: listNFTTxRes.error }
                );
            }
            else {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'DONE', message: `Item Listed successfully with id as ${listNFTTxRes.listed_itemid}.` }
                );
            }
        })
        .catch(async (err) => {
            await AsyncJobStatus.findByIdAndUpdate(
                asyncListJob._id,
                { status: 'FAILED', message: err }
            );
        });
        
        return res.status(202).json({ success: true, result: {
            id: asyncListJob._id,
            status: 'PENDING',
            message: listingTransactionInitiationMessage
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.getAsyncJobStatus = async (req, res) => {
    const { jobId } = req.params;
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );

        const jobStatus = await AsyncJobStatus.findById(
            jobId
        );

        if (jobStatus.user !== user.username) {
            return res.status(404).json({
                success: false, 
                message: `JobId ${jobId} not found for user ${user.username}.`
            }); 
        }
        
        return res.status(200).json({
            success: true, 
            result: {
                id: jobStatus._id,
                status: jobStatus.status,
                message: jobStatus.message
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.getNftDetail = async (req, res) => {
    const { nftId } = req.params;
    try {
        const getSpecificNftDetailsTxn = await nftService.getNftDetail(nftId);
        res.status(201).json({ success: true, result: getSpecificNftDetailsTxn });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Buy an NFT
exports.buyNFT = async (req, res) => {
    const { itemId } = req.params;

    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Buying NFT from user: "+ JSON.stringify(user));
        console.log();

        const wallet = await getUserWallet(user);

        const tx = await nftService.buyNFT(itemId, wallet);
        if (!tx.nft_bought) {
            return res.status(400).json({ success: false, message: tx.error.message });
        }

        res.status(200).json({ success: true, transaction: tx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Buy an NFT (Async)
exports.buyNFTJob = async (req, res) => {
    const { itemId } = req.params;

    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Buying NFT from user: "+ JSON.stringify(user));
        console.log();

        const wallet = await getUserWallet(user);
        const buyingTransactionInitiationMessage = 'Item Buying from marketplace transaction started successfully.';
        const asyncListJob = new AsyncJobStatus({ user: user.username, status: 'PENDING', message: buyingTransactionInitiationMessage });
        await asyncListJob.save();

        nftService.buyNFT(itemId, wallet)
        .then(async (tx) => {
            if (!tx.nft_bought) {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'FAILED', message: tx.error }
                );
            } else {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'DONE', message: `Item Bought successfully.` }
                );
            }
        })
        .catch(async (err) => {
            await AsyncJobStatus.findByIdAndUpdate(
                asyncListJob._id,
                { status: 'FAILED', message: err }
            );
        });
        
        return res.status(202).json({ success: true, result: {
            id: asyncListJob._id,
            status: 'PENDING',
            message: buyingTransactionInitiationMessage
        }});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Sell an NFT
exports.resellNFT = async (req, res) => {
    const { itemId } = req.params;

    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("ReListing NFT from user: "+ JSON.stringify(user));
        console.log();

        const sellerWallet = await getUserWallet(user);
        const tx = await nftService.resellNFT(itemId, req.body.resell_price, sellerWallet);
        if (!tx.item_listed) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(201).json({ success: true, transaction: tx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sell an NFT (Async)
exports.resellNFTJob = async (req, res) => {
    const { itemId } = req.params;

    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("ReListing NFT from user: "+ JSON.stringify(user));
        console.log();

        const sellerWallet = await getUserWallet(user);
        const relistingTransactionInitiationMessage = 'Item Relisting on marketplace transaction started successfully.';
        const asyncListJob = new AsyncJobStatus({ user: user.username, status: 'PENDING', message: relistingTransactionInitiationMessage });
        await asyncListJob.save();

        nftService.resellNFT(itemId, req.body.resell_price, sellerWallet)
        .then(async (tx) => {
            if (!tx.item_listed) {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'FAILED', message: tx.error }
                );    
            } else {
                await AsyncJobStatus.findByIdAndUpdate(
                    asyncListJob._id,
                    { status: 'DONE', message: `Item ReListed successfully.` }
                );
            }
        })
        .catch(async (err) => {
            await AsyncJobStatus.findByIdAndUpdate(
                asyncListJob._id,
                { status: 'FAILED', message: err }
            );
        });
        
        return res.status(202).json({ success: true, result: {
            id: asyncListJob._id,
            status: 'PENDING',
            message: relistingTransactionInitiationMessage
        } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.userTransactions = async (req, res) => {
    const { userId } = req.params;
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user || user.id !== userId) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2}
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );
        console.log("Getting transactions for user "+ JSON.stringify(user));
        console.log();

        const userWallet = await getUserWallet(user);
        const userTxns = await nftService.getUserTransactions(userWallet.address);
        res.status(200).json({ success: true, transactions: userTxns.result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.burnNFT = async (req, res) => {
    const { itemId } = req.params;
    try {
        // Fetch user and decrypt the mnemonic
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.numReqLeft <= 0) {
            const retryTime = calculateNextWindowTimeInMinutes(user.lastLimitUpdateTime);
            if(Math.ceil(retryTime) <= 0) {
                await User.findByIdAndUpdate(
                    user._id,
                    { lastLimitUpdate: Math.floor(Date.now() / 1000), numReqLeft: 2 }
                );
            } else {
                return res.status(429).json({ success: false, message: `You have exhausted your api call limit. Retry after ${retryTime} mins` })
            }
        }

        // reduce the request limit by 1
        await User.findByIdAndUpdate(
            user._id,
            { numReqLeft: user.numReqLeft - 1 }
        );

        const userWallet = await getUserWallet(user);

        const removeItemTx = await nftService.removeItemFromMarketplace(userWallet, itemId);
        if (removeItemTx && removeItemTx.error) {
            return res.status(400).json({ success: false, message: removeItemTx.error.message });
        }
        console.log("Removed NFT from Marketplace "+ JSON.stringify(user));
        console.log();

        res.status(200).json({ success: true, transactions: {
            item_removed: itemId
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } 
}