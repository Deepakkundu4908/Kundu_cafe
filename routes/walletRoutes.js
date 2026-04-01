const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get wallet page
router.get('/', verifyToken, walletController.getWallet);

// Top up wallet
router.post('/topup', verifyToken, walletController.topUpWallet);

module.exports = router;
