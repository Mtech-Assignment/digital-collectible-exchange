const express = require('express');
const router = express.Router();
const authenticateJWT = require('../../middleware/auth');
const nftController = require('../../controllers/nftController');
const walletController = require('../../controllers/walletController');
const authController = require('../../controllers/authController');

// Register endpoint
router.post('/register', authController.register);

// Login endpoint
router.post('/login', authController.login);

// Get the user transactions
router.get('/:userId/transactions', authenticateJWT, nftController.userTransactions);

// Get all user owned nfts
router.get('/:userId/nft', authenticateJWT, nftController.getUserOwnedNFTOnMarketplace);

// Get all Listed NFTs on marketplace
router.get('/:userId/nft/listed', nftController.getUserListedNFTOnMarketplace);

// POST to create wallet from existing mnemonic
router.post('/wallet', walletController.createWallet);

// GET to retrieve wallet details from JWT
router.get('/:userId/wallet', authenticateJWT, walletController.getWallet);

module.exports = router;
