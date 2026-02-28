const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image_url', 'stock_quantity']
            }]
        });

        // Calculate total in ₹
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.Product.price) * item.quantity);
        }, 0);

        res.json({
            items: cartItems,
            total: `₹${total.toFixed(2)}`
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, quantity = 1 } = req.body;

        // Check if product exists and has stock
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock_quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Check if item already in cart
        const existingItem = await Cart.findOne({
            where: {
                user_id: req.user.id,
                product_id: productId
            }
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock_quantity < newQuantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            existingItem.quantity = newQuantity;
            await existingItem.save();
            
            return res.json({ 
                message: 'Cart updated successfully',
                item: existingItem 
            });
        }

        // Create new cart item
        const cartItem = await Cart.create({
            user_id: req.user.id,
            product_id: productId,
            quantity
        });

        // Fetch the created item with product details
        const newItem = await Cart.findByPk(cartItem.id, {
            include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image_url']
            }]
        });

        res.status(201).json({
            message: 'Item added to cart',
            item: newItem
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;

        const cartItem = await Cart.findOne({
            where: {
                id: itemId,
                user_id: req.user.id
            },
            include: [Product]
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (quantity <= 0) {
            await cartItem.destroy();
            return res.json({ message: 'Item removed from cart' });
        }

        // Check stock
        if (cartItem.Product.stock_quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({
            message: 'Cart updated',
            item: cartItem
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cartItem = await Cart.findOne({
            where: {
                id: itemId,
                user_id: req.user.id
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        await cartItem.destroy();

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        await Cart.destroy({
            where: { user_id: req.user.id }
        });

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};