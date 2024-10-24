const express = require('express');
const multer = require('multer');
const router = express.Router();
const nftController = require('../../controllers/nftController');
const authenticateJWT = require('../../middleware/auth');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Initialize multer with the storage option

// Mint an NFT
router.post('/mint', authenticateJWT, upload.single('file'), nftController.mintNFT);

// List an NFT on marketplace
router.post('/:nftId/list', authenticateJWT, nftController.listNFTOnMarketplace);

// Buy an NFT
router.post('/:itemId/buy', authenticateJWT, nftController.buyNFT);

// List an NFT on marketplace for sell
router.post('/:itemId/resell', authenticateJWT, nftController.resellNFT);

// Get all the listed nfts on marketplace
router.get('/listed', nftController.getListedNFTOnMarketplace);

module.exports = router;
