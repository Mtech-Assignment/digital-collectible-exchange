const express = require('express');
const multer = require('multer');
const router = express.Router();
const nftController = require('../../controllers/nftController');
const authenticateJWT = require('../../middleware/auth'); // Import the JWT middleware

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Initialize multer with the storage option

// Mint an NFT
router.post('/mint', authenticateJWT, upload.single('file'), nftController.mintNFT);

// List an NFT on marketplace
router.post('/:nftId/list', authenticateJWT, nftController.listNFTOnMarketplace);

// Buy an NFT
router.post('/:itemId/buy', authenticateJWT, nftController.buyNFT);

// List an NFT on marketplace
router.post('/:nftId/resell', authenticateJWT, nftController.resellNFT);

// Sell an NFT
// router.post('/users/:userId/nfts/:nftId/sell', authenticateJWT, nftController.sellNFT);

// List all NFTs for a user
// router.get('/nft', authenticateJWT, nftController.listNFTs);


// Get all Listed NFTs on marketplace
router.get('/nft', nftController.getListedNFTOnMarketplace);

router.get('/user/nft', authenticateJWT, nftController.getUserOwnedNFTOnMarketplace);

router.get('/user/nft', authenticateJWT, nftController.getUserOwnedNFTOnMarketplace);

router.get('/user/transaction', authenticateJWT, nftController.userTransactions);

// // Get owned NFTs for a user
// router.get('/users/:userId/nfts/owned', authenticateJWT, nftController.getOwnedNFTs);

// // Get sold NFTs for a user
// router.get('/users/:userId/nfts/sold', authenticateJWT, nftController.getSoldNFTs);

module.exports = router;
