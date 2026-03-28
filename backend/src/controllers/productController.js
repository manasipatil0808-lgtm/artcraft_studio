// src/controllers/productController.js
const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Get all products (public)
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    let whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
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
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "name",
        "description",
        "price",
        "category",
        "image",
        "image_url",
        "stock_quantity",
        "customizable",
        "created_at",
        "updated_at",
      ],
    });

    const formattedProducts = products.rows.map((product) => ({
      ...product.toJSON(),
      price: `₹${parseFloat(product.price).toFixed(2)}`,
    }));

    res.json({
      products: formattedProducts,
      total: products.count,
      page: parseInt(page),
      totalPages: Math.ceil(products.count / limit),
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "description",
        "price",
        "category",
        "image",
        "image_url",
        "stock_quantity",
        "customizable",
        "created_at",
        "updated_at",
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formattedProduct = {
      ...product.toJSON(),
      price: `₹${parseFloat(product.price).toFixed(2)}`,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
    });
    res.json(categories.map((c) => c.category));
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product (Admin) - JSON only
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      image_url,
      stock_quantity,
      customizable,
    } = req.body;

    const product = await Product.create({
      name,
      description: description || "",
      price: parseFloat(price),
      category: category || "General",
      image: image || null,
      image_url: image_url || null,
      stock_quantity: parseInt(stock_quantity) || 0,
      customizable: customizable || false,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...product.toJSON(),
        price: `₹${parseFloat(product.price).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Create product with image upload (FormData)
const createProductWithImage = async (req, res) => {
  try {
    // Check for file validation error
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const { name, description, price, category, stock_quantity, customizable } =
      req.body;

    // Validate required fields
    if (!name || !price) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Name and price are required" });
    }

    let imageData = null;
    let imageUrl = null;

    // Handle image upload
    if (req.file) {
      // Read file and convert to base64
      const imageBuffer = fs.readFileSync(req.file.path);
      imageData = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;

      // Also store file path if you want URL access
      imageUrl = `/uploads/${req.file.filename}`;

      // Optionally delete the file after converting to base64
      // fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ message: "Product image is required" });
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: parseFloat(price),
      category: category || "General",
      image: imageData, // Store base64
      image_url: imageUrl, // Store URL path
      stock_quantity: parseInt(stock_quantity) || 0,
      customizable: customizable === "true" || customizable === true,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...product.toJSON(),
        price: `₹${parseFloat(product.price).toFixed(2)}`,
      },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Create product with image error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Update product (Admin) - JSON only
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      image_url,
      stock_quantity,
      customizable,
    } = req.body;

    await product.update({
      name: name || product.name,
      description:
        description !== undefined ? description : product.description,
      price: price ? parseFloat(price) : product.price,
      category: category || product.category,
      image: image !== undefined ? image : product.image,
      image_url: image_url !== undefined ? image_url : product.image_url,
      stock_quantity:
        stock_quantity !== undefined
          ? parseInt(stock_quantity)
          : product.stock_quantity,
      customizable:
        customizable !== undefined ? customizable : product.customizable,
    });

    res.json({
      message: "Product updated successfully",
      product: {
        ...product.toJSON(),
        price: `₹${parseFloat(product.price).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product with image upload (FormData)
const updateProductWithImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, description, price, category, stock_quantity, customizable } =
      req.body;

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (stock_quantity !== undefined)
      updateData.stock_quantity = parseInt(stock_quantity);
    if (customizable !== undefined)
      updateData.customizable =
        customizable === "true" || customizable === true;

    // Handle image update
    if (req.file) {
      // Convert new image to base64
      const imageBuffer = fs.readFileSync(req.file.path);
      updateData.image = `data:${req.file.mimetype};base64,${imageBuffer.toString("base64")}`;
      updateData.image_url = `/uploads/${req.file.filename}`;

      // Optionally delete the file after conversion
      // fs.unlinkSync(req.file.path);
    }

    await product.update(updateData);

    res.json({
      message: "Product updated successfully",
      product: {
        ...product.toJSON(),
        price: `₹${parseFloat(product.price).toFixed(2)}`,
      },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Update product with image error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all functions
module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  createProductWithImage, // Add this
  updateProduct,
  updateProductWithImage, // Add this
  deleteProduct,
};
