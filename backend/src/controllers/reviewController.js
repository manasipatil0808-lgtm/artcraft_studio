// src/controllers/reviewController.js
const { validationResult } = require("express-validator");
const Review = require("../models/Review");
const User = require("../models/User");

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Format reviews for frontend
    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.product_id.toString(),
      userName: r.User?.name || "Anonymous",
      userId: r.user_id,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
    }));

    res.json({ reviews: formatted });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Add a review (authenticated users only)
exports.addReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      where: {
        user_id: req.user.id,
        product_id: productId,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user_id: req.user.id,
      product_id: productId,
      rating,
      comment,
    });

    // Fetch with user data
    const fullReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      message: "Review added successfully",
      review: {
        id: fullReview.id,
        productId: fullReview.product_id.toString(),
        userName: fullReview.User?.name || "Anonymous",
        userId: fullReview.user_id,
        rating: fullReview.rating,
        comment: fullReview.comment,
        date: fullReview.created_at,
      },
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// Delete a review (owner or admin only)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review owner or admin can delete
    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
