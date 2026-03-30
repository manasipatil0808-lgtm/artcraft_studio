const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorizeSeller } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', [
    body('shipping_address').notEmpty().withMessage('Shipping address required'),
    body('payment_method').notEmpty().withMessage('Payment method required')
], orderController.createOrder);

router.post('/verify-payment', orderController.verifyPayment);
router.post('/send-invoice', orderController.sendInvoice);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);
router.put('/cancel/:id', orderController.cancelOrder);

// Admin routes
router.get('/admin/all', authorizeSeller, orderController.getAllOrders);
router.put('/admin/:id/status', authorizeSeller, orderController.updateOrderStatus);

module.exports = router;