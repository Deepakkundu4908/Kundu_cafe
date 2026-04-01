const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Admin dashboard
router.get('/', verifyToken, adminMiddleware, adminController.getDashboard);

// Items management
router.get('/items', verifyToken, adminMiddleware, adminController.getItems);
router.post('/items/add', verifyToken, adminMiddleware, upload.single('image'), adminController.addItem);
router.post('/items/:itemId/update', verifyToken, adminMiddleware, upload.single('image'), adminController.updateItem);
router.post('/items/:itemId/delete', verifyToken, adminMiddleware, adminController.deleteItem);

// Items management continued
router.post('/items/:itemId/toggle-stock', verifyToken, adminMiddleware, adminController.toggleStock);
router.get('/items/:itemId/edit', verifyToken, adminMiddleware, adminController.getEditItem);

// Orders management\nrouter.get('/orders', verifyToken, adminMiddleware, adminController.getAllOrders);\nrouter.post('/orders/:orderId/status', verifyToken, adminMiddleware, adminController.updateOrderStatus);\n\n// Broadcast messages\nrouter.post('/broadcast', verifyToken, adminMiddleware, adminController.broadcastMessage);

module.exports = router;
