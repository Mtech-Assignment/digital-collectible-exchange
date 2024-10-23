const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/walletController');
const authenticateJWT = require('../../middleware/auth');

// POST to create wallet from existing mnemonic
router.post('/', walletController.createWallet);

// GET to retrieve wallet details from JWT
router.get('/', authenticateJWT, walletController.getWallet);

module.exports = router;
