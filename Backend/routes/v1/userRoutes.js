const express = require('express');
const router = express.Router();
const authenticateJWT = require('../../middleware/auth');
const nftController = require('../../controllers/nftController');
const walletController = require('../../controllers/walletController');
const authController = require('../../controllers/authController');

// Get the user transactions
router.get('/:userId/transactions', authenticateJWT, nftController.userTransactions);

// POST to create wallet from existing mnemonic
router.post('/wallet', walletController.createWallet);

// GET to retrieve wallet details from JWT
router.get('/:userId/wallet', authenticateJWT, walletController.getWallet);

// Get user owned nft or user listed nft if listed=true query param is available 
router.get('/:userId/nft', authenticateJWT, (req, res, next) => { 
    if (req.query.listed) {
        nftController.getUserListedNFTOnMarketplace(req, res, next);
    } else {
        nftController.getUserOwnedNFTOnMarketplace(req, res, next);
    }
});

// Register endpoint
router.post('/', authController.register);

// Login endpoint
router.post('/sessions', authController.login);

module.exports = router;