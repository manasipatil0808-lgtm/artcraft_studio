// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Check if Supabase credentials are valid
let supabase = null;
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only initialize if credentials are valid and URL format is correct
if (supabaseUrl && supabaseKey && supabaseUrl.trim().startsWith('https://')) {
    try {
        supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());
        console.log('✅ Supabase initialized successfully');
    } catch (error) {
        console.warn('⚠️ Supabase initialization failed:', error.message);
        console.warn('⚠️ Using mock payment system instead');
        supabase = null;
    }
} else {
    console.warn('⚠️ Supabase not configured or invalid URL - using mock payment system');
    if (supabaseUrl) {
        console.warn('   Make sure SUPABASE_URL starts with https://');
    }
}

// Mock payment function for development
const createSupabasePayment = async (paymentData) => {
    console.log('📝 Mock payment created for order:', paymentData.orderNumber);
    
    // Return mock payment data for development
    return {
        id: 'mock_pay_' + Date.now(),
        checkout_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?order=${paymentData.orderNumber}`
    };
};

// Mock verify payment
const verifyPayment = async (paymentId) => {
    console.log('🔍 Mock payment verification for ID:', paymentId);
    return {
        id: paymentId,
        status: 'success',
        amount: 1000,
        verified_at: new Date().toISOString()
    };
};

module.exports = {
    supabase,
    createSupabasePayment,
    verifyPayment
};