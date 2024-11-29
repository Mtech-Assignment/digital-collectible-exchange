const express = require('express');
const nftRoutes = require('./nftRoutes');
const userRoutes = require('./userRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const router = express.Router();

router.use('/users', userRoutes);
router.use('/nft', nftRoutes);
router.use('/marketplace', marketplaceRoutes)

module.exports = router;
