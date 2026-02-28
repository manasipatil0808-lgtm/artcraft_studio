const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');

// Define all associations
const setupAssociations = () => {
    // User associations
    User.hasMany(Cart, { foreignKey: 'user_id' });
    User.hasMany(Order, { foreignKey: 'user_id' });
    
    // Product associations
    Product.hasMany(Cart, { foreignKey: 'product_id' });
    Product.hasMany(OrderItem, { foreignKey: 'product_id' });
    
    // Order associations
    Order.belongsTo(User, { foreignKey: 'user_id' });
    Order.hasMany(OrderItem, { foreignKey: 'order_id' });
    Order.hasOne(Payment, { foreignKey: 'order_id' });
    
    // Cart associations
    Cart.belongsTo(User, { foreignKey: 'user_id' });
    Cart.belongsTo(Product, { foreignKey: 'product_id' });
    
    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
    OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
    
    // Payment associations
    Payment.belongsTo(Order, { foreignKey: 'order_id' });
};

module.exports = {
    User,
    Product,
    Cart,
    Order,
    OrderItem,
    Payment,
    setupAssociations
};