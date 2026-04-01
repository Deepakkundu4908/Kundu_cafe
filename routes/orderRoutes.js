const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get checkout page with time options
router.get('/checkout', verifyToken, orderController.getCheckout);

// Create new order
router.post('/create', verifyToken, orderController.createOrder);

// Get user orders (all)
router.get('/', verifyToken, orderController.getUserOrders);

// Get order details (specific order)
router.get('/:orderId', verifyToken, orderController.getOrderDetails);

module.exports = router;
