const express = require('express');
const multer = require('multer');
const router = express.Router();
const nftController = require('../../controllers/nftController');
const authenticateJWT = require('../../middleware/auth');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Initialize multer with the storage option

// Mint an NFT
router.post('/mint', authenticateJWT, upload.single('file'), nftController.mintNFT);

router.get('/:nftId',  nftController.getNftDetail);

// Mint an NFT (Async)
router.post('/mint/jobs', authenticateJWT, upload.single('file'), nftController.mintNFTJob);

router.get('/mint/jobs/:jobId', authenticateJWT, nftController.getAsyncJobStatus);

module.exports = router;
