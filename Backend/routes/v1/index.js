const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');
const nftRoutes = require('./nftRoutes');

router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/nft', nftRoutes);

module.exports = router;
