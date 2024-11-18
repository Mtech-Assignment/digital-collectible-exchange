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
router.post('/:nftId/listing', authenticateJWT, nftController.listNFTOnMarketplace);

// NFT listing on marketplace async job
router.post('/:nftId/listing/jobs', authenticateJWT, nftController.listNftOnMarketplaceJob);

// Get Status of NFT listing on marketplace async job
router.get('/listing/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

// Buy an NFT (Just changing the ownership)
router.put('/:itemId/buy', authenticateJWT, nftController.buyNFT);

// Buy NFT (async job)
router.put('/:itemId/buy/jobs', authenticateJWT, nftController.buyNFTJob);

// Get status of Buy NFT async job
router.get('/buy/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

// List an NFT on marketplace for sell
router.put('/:itemId/resell', authenticateJWT, nftController.resellNFT);

// List an NFT on marketplace for sell (async job)
router.put('/:itemId/resell/jobs', authenticateJWT, nftController.resellNFTJob);

// Get status of re-listing an NFT on marketplace for resell
router.get('/resell/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

// Get all the listed nfts on marketplace
router.get('/listings', nftController.getListedNFTOnMarketplace);

router.get('/:nftId',  nftController.getNftDetail);

router.delete('/:itemId', authenticateJWT, nftController.burnNFT);

module.exports = router;
