// src/config/razorpay.js
const Razorpay = require("razorpay");
const dotenv = require("dotenv");

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("⚠️ Razorpay credentials missing. Online payment will be unavailable.");
  module.exports = null;
} else {
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  console.log("✅ Razorpay initialized successfully");
  module.exports = razorpay;
}
