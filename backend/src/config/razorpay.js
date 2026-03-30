// src/config/razorpay.js
const Razorpay = require("razorpay");
const dotenv = require("dotenv");

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_SVSDsBnFYB2WI";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "4RA1zg0wZhT4Bm9pu4BGWgoi";

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
