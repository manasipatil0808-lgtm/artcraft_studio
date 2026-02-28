// src/controllers/productController.js
const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const { Op } = require('sequelize');

// Get all products (public)
const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        
        let whereClause = {};
        
        if (category) {
            whereClause.category = category;
        }
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = minPrice;
            if (maxPrice) whereClause.price[Op.lte] = maxPrice;
        }
        
        const offset = (page - 1) * limit;
        
        const products = await Product.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            attributes: [
                'id', 'name', 'description', 'price', 'category', 
                'image_url', 'stock_quantity', 'created_at', 'updated_at'
            ]
        });

        const formattedProducts = products.rows.map(product => ({
            ...product.toJSON(),
            price: `₹${parseFloat(product.price).toFixed(2)}`
        }));

        res.json({
            products: formattedProducts,
            total: products.count,
            page: parseInt(page),
            totalPages: Math.ceil(products.count / limit)
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const formattedProduct = {
            ...product.toJSON(),
            price: `₹${parseFloat(product.price).toFixed(2)}`
        };
        res.json(formattedProduct);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: ['category'],
            group: ['category']
        });
        res.json(categories.map(c => c.category));
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product (Admin)
const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, price, category, image_url, stock_quantity } = req.body;

        const product = await Product.create({
            name, description, price, category, image_url, stock_quantity
        });

        res.status(201).json({
            message: 'Product created successfully',
            product: {
                ...product.toJSON(),
                price: `₹${parseFloat(product.price).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, description, price, category, image_url, stock_quantity } = req.body;

        await product.update({
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            category: category || product.category,
            image_url: image_url || product.image_url,
            stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity
        });

        res.json({
            message: 'Product updated successfully',
            product: {
                ...product.toJSON(),
                price: `₹${parseFloat(product.price).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export all functions
module.exports = {
    getAllProducts,
    getProductById,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct
};