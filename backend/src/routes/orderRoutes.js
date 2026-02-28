const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', [
    body('shipping_address').notEmpty().withMessage('Shipping address required'),
    body('payment_method').notEmpty().withMessage('Payment method required')
], orderController.createOrder);

router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);

// Admin routes
router.get('/admin/all', authorizeAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authorizeAdmin, orderController.updateOrderStatus);

module.exports = router;