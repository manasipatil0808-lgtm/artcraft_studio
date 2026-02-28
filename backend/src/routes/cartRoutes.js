const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/add', validateCartItem, cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;