const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Get reviews for a product (public)
router.get("/product/:productId", reviewController.getProductReviews);

// Add a review (authenticated)
router.post(
  "/",
  authenticate,
  [
    body("productId")
      .notEmpty()
      .withMessage("Product ID is required")
      .isInt()
      .withMessage("Invalid product ID"),
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .trim()
      .notEmpty()
      .withMessage("Comment is required")
      .isLength({ min: 5, max: 1000 })
      .withMessage("Comment must be 5-1000 characters"),
  ],
  reviewController.addReview
);

// Delete a review (owner or admin)
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;
