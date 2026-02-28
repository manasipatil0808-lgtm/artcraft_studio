// src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING(100)
    },
    image_url: {
        type: DataTypes.STRING(500)
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',     // Map to actual column name
    updatedAt: 'updated_at',     // Map to actual column name
    underscored: true            // Use snake_case for auto-generated fields
});

module.exports = Product;