const express = require('express');
const multer = require('multer');
const router = express.Router();
const nftController = require('../../controllers/nftController');
const authenticateJWT = require('../../middleware/auth');


// List an NFT on marketplace
router.post('/:nftId/listings', authenticateJWT, nftController.listNFTOnMarketplace);

// Get all the listed nfts on marketplace
router.get('/listings', nftController.getListedNFTOnMarketplace);

// NFT listing on marketplace async job
router.post('/:nftId/listings/jobs', authenticateJWT, nftController.listNftOnMarketplaceJob);

// Get Status of NFT listing on marketplace async job
router.get('/listings/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

// Buy NFT from Marketplace or Resell NFT on Marketplace (Synchronous)
router.put('/listings/:itemId', authenticateJWT, (req, res, next) => {
    if (req.query.op === 'buy') {
        nftController.buyNFT(req, res, next);
    } else if(req.query.op === 'resell') {
        nftController.resellNFT(req, res, next);
    }
});

// Buy NFT from marketplace or Resell NFT on marketplace (Async job)
router.put('/listings/:itemId/jobs', authenticateJWT, (req, res, next) => {
    if (req.query.op === 'buy') {
        nftController.buyNFTJob(req, res, next);
    } else if (req.query.op === 'resell') {
        nftController.resellNFTJob(req, res, next);
    }
});

// Get status of Buy NFT or Resell NFT async job
router.get('/listings/:itemId/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

router.delete('/:itemId', authenticateJWT, nftController.burnNFT);

module.exports = router;
