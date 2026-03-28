// src/controllers/orderController.js
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { sendInvoiceEmail } = require("../config/email");

// Get Razorpay instance (may be null if keys not configured)
const getRazorpay = () => {
  try {
    return require("../config/razorpay");
  } catch (e) {
    return null;
  }
};

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
      include: [Product],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total and check stock
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.Product.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.Product.name}`,
        });
      }
      totalAmount += parseFloat(item.Product.price) * item.quantity;
    }

    // Generate unique order number
    const orderNumber = "ORD-" + uuidv4().substring(0, 8).toUpperCase();

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      order_number: orderNumber,
      total_amount: totalAmount,
      shipping_address,
      status: "pending",
      payment_status: "pending",
    });

    // Create order items and update stock
    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.Product.price,
      });

      // Update product stock
      await item.Product.update({
        stock_quantity: item.Product.stock_quantity - item.quantity,
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order_id: order.id,
      amount: totalAmount,
      payment_method: payment_method || "cod",
      payment_status: "pending",
    });

    // Handle Razorpay online payment
    if (payment_method === "razorpay") {
      const razorpay = getRazorpay();
      if (!razorpay) {
        return res.status(500).json({
          message: "Online payment is not configured. Please use COD.",
        });
      }

      try {
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
          currency: "INR",
          receipt: order.order_number,
          notes: {
            order_id: order.id.toString(),
            user_id: req.user.id.toString(),
          },
        });

        // Update payment record with Razorpay order ID
        await payment.update({
          transaction_id: razorpayOrder.id,
          payment_status: "pending",
        });

        return res.status(201).json({
          message: "Razorpay order created",
          order: {
            id: order.id,
            order_number: order.order_number,
            total_amount: `₹${totalAmount.toFixed(2)}`,
          },
          payment: {
            razorpay_order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
          },
        });
      } catch (error) {
        console.error("Razorpay order creation error:", error);
        return res.status(500).json({
          message: `Payment initialization failed: ${error.error?.description || error.message || 'Unknown error'}. Please try again or use COD.`,
        });
      }
    }

    // COD order — clear cart and return success
    await Cart.destroy({ where: { user_id: req.user.id } });

    return res.status(201).json({
      message: "Order placed successfully!",
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: `₹${totalAmount.toFixed(2)}`,
        status: "pending",
        payment_method: "cod",
        shipping_address,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Payment verification not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Payment verification failed
      await Order.update(
        { payment_status: "failed" },
        { where: { id: order_id, user_id: req.user.id } }
      );
      await Payment.update(
        { payment_status: "failed" },
        { where: { order_id: order_id } }
      );
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Payment verified — update order and payment
    await Order.update(
      { payment_status: "completed", status: "processing" },
      { where: { id: order_id, user_id: req.user.id } }
    );
    await Payment.update(
      {
        payment_status: "success",
        transaction_id: razorpay_payment_id,
      },
      { where: { order_id: order_id } }
    );

    // Clear cart
    await Cart.destroy({ where: { user_id: req.user.id } });

    const order = await Order.findByPk(order_id);

    return res.json({
      message: "Payment verified successfully!",
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status,
        payment_status: "completed",
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Server error during payment verification" });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "image_url"],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "order_number",
        "total_amount",
        "status",
        "payment_status",
        "shipping_address",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]],
    });

    // Format response with ₹ currency
    const formattedOrders = orders.map((order) => ({
      ...order.toJSON(),
      total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
      created_at: order.created_at,
      updated_at: order.updated_at,
      OrderItems: order.OrderItems.map((item) => ({
        ...item.toJSON(),
        price: `₹${parseFloat(item.price).toFixed(2)}`,
      })),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        ...(req.user.role !== "admin" && { user_id: req.user.id }),
      },
      attributes: [
        "id",
        "order_number",
        "total_amount",
        "status",
        "payment_status",
        "shipping_address",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: OrderItem,
          attributes: ["id", "product_id", "quantity", "price"],
          include: [
            {
              model: Product,
              attributes: [
                "id",
                "name",
                "description",
                "image_url",
                "category",
              ],
            },
          ],
        },
        {
          model: Payment,
          attributes: [
            "id",
            "payment_method",
            "payment_status",
            "transaction_id",
            "amount",
          ],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Format with ₹ currency
    const formattedOrder = {
      ...order.toJSON(),
      total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
      created_at: order.created_at,
      updated_at: order.updated_at,
      OrderItems: order.OrderItems.map((item) => ({
        ...item.toJSON(),
        price: `₹${parseFloat(item.price).toFixed(2)}`,
      })),
      Payment: order.Payment
        ? {
            ...order.Payment.toJSON(),
            amount: `₹${parseFloat(order.Payment.amount).toFixed(2)}`,
          }
        : null,
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;

    await order.save();

    // If payment status is updated, also update the payment record
    if (payment_status) {
      await Payment.update({ payment_status }, { where: { order_id: id } });
    }

    res.json({
      message: "Order updated successfully",
      order: {
        ...order.toJSON(),
        total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: [
        // Explicitly specify attributes with correct names
        "id",
        "user_id",
        "order_number",
        "total_amount",
        "status",
        "payment_status",
        "shipping_address",
        "created_at", // Use snake_case
        "updated_at", // Use snake_case
      ],
      order: [["created_at", "DESC"]], // Order by created_at
    });

    // Format with ₹ currency
    const formattedOrders = orders.map((order) => {
      const orderJson = order.toJSON();
      return {
        ...orderJson,
        total_amount: `₹${parseFloat(orderJson.total_amount).toFixed(2)}`,
        createdAt: orderJson.created_at, // Add camelCase versions for frontend
        updatedAt: orderJson.updated_at,
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
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
        status: "pending", // Only pending orders can be cancelled
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or cannot be cancelled" });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    // Restore product stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: id },
      include: [Product],
    });

    for (const item of orderItems) {
      await item.Product.update({
        stock_quantity: item.Product.stock_quantity + item.quantity,
      });
    }

    res.json({
      message: "Order cancelled successfully",
      order: {
        ...order.toJSON(),
        total_amount: `₹${parseFloat(order.total_amount).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send invoice email
exports.sendInvoice = async (req, res) => {
  try {
    const { email, invoiceData } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    if (!invoiceData) {
      return res.status(400).json({ message: "Invoice data is required" });
    }

    await sendInvoiceEmail(email, invoiceData);

    res.json({ message: `Invoice sent successfully to ${email}` });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({
      message: error.message || "Failed to send invoice email",
    });
  }
};
