// src/config/email.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER || "artcraftstudio0821@gmail.com";
const smtpPass = process.env.SMTP_PASS || "fuzchsytbjyzvlus";

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort) || 587,
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Verify connection (non-blocking)
  transporter.verify().then(() => {
    console.log("✅ SMTP email configured successfully");
  }).catch((error) => {
    console.warn("⚠️ SMTP connection failed:", error.message);
    console.warn("   Email features will be unavailable until SMTP is configured.");
    transporter = null;
  });
} else {
  console.warn("⚠️ SMTP credentials missing. Email features will be unavailable.");
}

module.exports = {
  getTransporter: () => transporter,

  sendInvoiceEmail: async (to, invoiceData) => {
    if (!transporter) {
      throw new Error("Email service is not configured. Please set SMTP credentials in .env");
    }

    const { orderNumber, customerName, items, total, address, date } = invoiceData;

    // Build items table rows
    const itemRows = (items || []).map(item => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || 'Unknown'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${(price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const numericTotal = typeof total === 'number' ? total : parseFloat(String(total).replace(/[₹$,]/g, '')) || 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { padding: 30px; background: #fff; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
          .total-row { background: #fdf2f8; }
          .total-amount { color: #ec4899; font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎨 Handmade by You</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Your Invoice</p>
        </div>
        <div class="content">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h2 style="margin: 0 0 5px; color: #374151;">Invoice</h2>
              <p style="margin: 0; color: #6b7280;">Order #${orderNumber}</p>
              <p style="margin: 0; color: #6b7280;">Date: ${new Date(date || Date.now()).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0 0 5px; font-weight: bold; color: #6b7280; font-size: 11px; text-transform: uppercase;">Bill To:</p>
            <p style="margin: 0; font-weight: bold;">${customerName || 'Customer'}</p>
            ${address ? `<p style="margin: 3px 0 0; color: #6b7280;">${address}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #374151;">
            <p style="margin: 5px 0;">Subtotal: <strong>₹${numericTotal.toFixed(2)}</strong></p>
            <p style="margin: 5px 0;">Shipping: <strong style="color: #16a34a;">Free</strong></p>
            <p class="total-amount" style="margin: 15px 0 0;">Total: ₹${numericTotal.toFixed(2)}</p>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for supporting handmade art! 🎨</p>
          <p>Handmade by You | support@handmadebyyou.com</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Handmade by You" <${smtpUser}>`,
      to,
      subject: `Invoice - Order #${orderNumber}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  },
};
