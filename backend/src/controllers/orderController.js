// src/controllers/orderController.js
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { shipping_address, payment_method } = req.body;

        // Get user's cart items
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [Product]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total and check stock
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.Product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${item.Product.name}` 
                });
            }
            totalAmount += parseFloat(item.Product.price) * item.quantity;
        }

        // Generate unique order number
        const orderNumber = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();

        // Create order
        const order = await Order.create({
            user_id: req.user.id,
            order_number: orderNumber,
            total_amount: totalAmount,
            shipping_address,
            status: 'pending',
            payment_status: 'pending'
        });

        // Create order items and update stock
        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.Product.price
            });

            // Update product stock
            await item.Product.update({
                stock_quantity: item.Product.stock_quantity - item.quantity
            });
        }

        // Create payment record
        const payment = await Payment.create({
            order_id: order.id,
            amount: totalAmount,
            payment_method: payment_method || 'cod',
            payment_status: 'pending'
        });

        // Initialize payment based on method
        let paymentReference = null;
        
        if (payment_method === 'supabase') {
            // Simplified payment for now - just create a mock payment
            paymentReference = {
                id: 'pay_' + Date.now(),
                checkout_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation/${order.id}`
            };
            
            // Update payment record with mock data
            await payment.update({
                supabase_payment_id: paymentReference.id,
                transaction_id: paymentReference.id,
                payment_status: 'completed' // Auto-complete for testing
            });
            
            // Also update order payment status
            await order.update({ payment_status: 'completed' });
            
        } else if (payment_method === 'cod') {
            // Cash on delivery - no online payment
            paymentReference = {
                id: 'cod_' + Date.now(),
                message: 'Pay cash on delivery'
            };
            
            await payment.update({
                transaction_id: paymentReference.id,
                payment_status: 'pending'
            });
        }

        // Clear user's cart
        await Cart.destroy({ where: { user_id: req.user.id } });

        // Format response with ₹ currency
        res.status(201).json({
            message: payment_method === 'cod' 
                ? 'Order placed successfully! Please pay ₹' + totalAmount.toFixed(2) + ' on delivery'
                : 'Order placed successfully! Payment completed.',
            order: {
                id: order.id,
                order_number: order.order_number,
                total_amount: `₹${totalAmount.toFixed(2)}`,
                status: order.status,
                payment_status: order.payment_status,
                created_at: order.created_at
            },
            payment: paymentReference ? {
                payment_id: paymentReference.id,
                checkout_url: paymentReference.checkout_url,
                message: paymentReference.message
            } : null
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error while creating order' });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'image_url']
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        // Format response with ₹ currency
        const formattedOrders = orders.map(order => ({
            ...order.toJSON(),
            total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
            OrderItems: order.OrderItems.map(item => ({
                ...item.toJSON(),
                price: `₹${parseFloat(item.price).toFixed(2)}`
            }))
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: { 
                id,
                ...(req.user.role !== 'admin' && { user_id: req.user.id })
            },
            include: [
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'image_url', 'description']
                    }]
                },
                {
                    model: Payment,
                    attributes: ['id', 'payment_method', 'payment_status', 'transaction_id', 'amount']
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Format with ₹ currency
        const formattedOrder = {
            ...order.toJSON(),
            total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
            OrderItems: order.OrderItems.map(item => ({
                ...item.toJSON(),
                price: `₹${parseFloat(item.price).toFixed(2)}`
            })),
            Payment: order.Payment ? {
                ...order.Payment.toJSON(),
                amount: `₹${parseFloat(order.Payment.amount).toFixed(2)}`
            } : null
        };

        res.json(formattedOrder);
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status) order.status = status;
        if (payment_status) order.payment_status = payment_status;
        
        await order.save();

        // If payment status is updated, also update the payment record
        if (payment_status) {
            await Payment.update(
                { payment_status },
                { where: { order_id: id } }
            );
        }

        res.json({
            message: 'Order updated successfully',
            order: {
                ...order.toJSON(),
                total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });

        // Format with ₹ currency
        const formattedOrders = orders.map(order => ({
            ...order.toJSON(),
            total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel order (User can cancel their pending orders)
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: { 
                id,
                user_id: req.user.id,
                status: 'pending' // Only pending orders can be cancelled
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        const orderItems = await OrderItem.findAll({
            where: { order_id: id },
            include: [Product]
        });

        for (const item of orderItems) {
            await item.Product.update({
                stock_quantity: item.Product.stock_quantity + item.quantity
            });
        }

        res.json({
            message: 'Order cancelled successfully',
            order: {
                ...order.toJSON(),
                total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};