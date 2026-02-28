// src/routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Check if controller is imported correctly
console.log('Product Controller:', productController);

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, validateProduct, productController.createProduct);
router.put('/:id', authenticate, authorizeAdmin, validateProduct, productController.updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);

module.exports = router;