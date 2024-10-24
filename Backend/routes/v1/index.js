const express = require('express');
const router = express.Router();

const nftRoutes = require('./nftRoutes');
const userRoutes = require('./userRoutes');

router.use('/user', userRoutes);
router.use('/nft', nftRoutes);

module.exports = router;
