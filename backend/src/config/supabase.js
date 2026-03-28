// src/config/supabase.js
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials missing. Supabase features will be unavailable.");
  module.exports = {
    supabase: null,
    createSupabasePayment: async () => {
      throw new Error("Supabase is not configured");
    },
  };
  return;
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple function to create a payment session
const createSupabasePayment = async (paymentData) => {
  try {
    const { amount, orderNumber, userId } = paymentData;

    // Insert payment record in Supabase
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          order_number: orderNumber,
          user_id: userId,
          amount: amount,
          currency: "INR",
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate a simple checkout URL
    const checkoutUrl = `${process.env.SUPABASE_URL}/functions/v1/create-checkout?payment_id=${data.id}`;

    return {
      id: data.id,
      checkout_url: checkoutUrl,
    };
  } catch (error) {
    console.error("Supabase payment error:", error);
    throw error;
  }
};

module.exports = {
  supabase,
  createSupabasePayment,
};
