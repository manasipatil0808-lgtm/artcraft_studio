// src/routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const { authenticate, authorizeSeller } = require("../middleware/auth");
const { validateProduct } = require("../middleware/validation");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
    // Create uploads directory if it doesn't exist
    if (!require("fs").existsSync(uploadDir)) {
      require("fs").mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (
    !file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)
  ) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Public routes
router.get("/", productController.getAllProducts);
router.get("/categories", productController.getCategories);
router.get("/:id", productController.getProductById);

// Admin routes (protected)
router.post(
  "/",
  authenticate,
  authorizeSeller,
  validateProduct,
  productController.createProduct,
);

// Route for creating product with image
router.post(
  "/with-image",
  authenticate,
  authorizeSeller,
  upload.single("image"),
  productController.createProductWithImage,
);

router.put(
  "/:id",
  authenticate,
  authorizeSeller,
  validateProduct,
  productController.updateProduct,
);

// Route for updating product with image
router.put(
  "/:id/with-image",
  authenticate,
  authorizeSeller,
  upload.single("image"),
  productController.updateProductWithImage,
);

router.delete(
  "/:id",
  authenticate,
  authorizeSeller,
  productController.deleteProduct,
);

module.exports = router;
