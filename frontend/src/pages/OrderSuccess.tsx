import { useLocation, Navigate, Link } from 'react-router';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { Download, CheckCircle, Home, Package, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../types';
import api from '../services/api';

export function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order as Order;
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!order) {
    return <Navigate to="/" />;
  }

  // Safely get numeric total
  const getTotal = (): number => {
    if (typeof order.total === 'number') return order.total;
    if (typeof order.total === 'string') {
      return parseFloat((order.total as string).replace(/[₹$,]/g, '')) || 0;
    }
    return 0;
  };

  const numericTotal = getTotal();

  // Generate PDF invoice using jsPDF directly (no html2canvas dependency issues)
  const handleDownloadInvoice = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', 14, y);

      pdf.setFontSize(14);
      pdf.setTextColor(219, 39, 119); // pink-600
      pdf.text('Handmade by You', pageWidth - 14, y, { align: 'right' });

      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Order #${order.id}`, 14, y);
      pdf.text('123 Creative Studio', pageWidth - 14, y, { align: 'right' });

      y += 5;
      pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 14, y);
      pdf.text('Artisan Street, Craft City', pageWidth - 14, y, { align: 'right' });

      y += 5;
      pdf.text('support@handmadebyyou.com', pageWidth - 14, y, { align: 'right' });

      // Divider
      y += 8;
      pdf.setDrawColor(200);
      pdf.line(14, y, pageWidth - 14, y);

      // Bill To
      y += 10;
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BILL TO:', 14, y);

      y += 6;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      if (order.customerName) pdf.text(order.customerName, 14, y);
      y += 5;
      if (order.customerEmail) pdf.text(order.customerEmail, 14, y);
      y += 5;
      if (order.customerPhone) pdf.text(order.customerPhone, 14, y);
      y += 5;
      if (order.address) pdf.text(order.address, 14, y);

      // Table header
      y += 12;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(14, y - 4, pageWidth - 28, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Item', 16, y);
      pdf.text('Qty', 120, y, { align: 'center' });
      pdf.text('Price', 150, y, { align: 'right' });
      pdf.text('Total', pageWidth - 16, y, { align: 'right' });

      // Table rows
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);

      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0;

          pdf.setFont('helvetica', 'bold');
          pdf.text(item.name || 'Unknown Item', 16, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(String(item.quantity), 120, y, { align: 'center' });
          pdf.text(`Rs.${itemPrice.toFixed(2)}`, 150, y, { align: 'right' });
          pdf.text(`Rs.${(itemPrice * item.quantity).toFixed(2)}`, pageWidth - 16, y, { align: 'right' });

          // Customizations
          if (item.customizations) {
            y += 4;
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            const customs: string[] = [];
            if (item.customizations.text) customs.push(`Text: "${item.customizations.text}"`);
            if (item.customizations.color) customs.push(`Color: ${item.customizations.color}`);
            if (customs.length > 0) pdf.text(customs.join(' | '), 16, y);
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
          }

          y += 7;
          pdf.setDrawColor(240);
          pdf.line(14, y, pageWidth - 14, y);
          y += 5;
        });
      }

      // Totals
      y += 5;
      pdf.setDrawColor(30);
      pdf.line(pageWidth / 2, y, pageWidth - 14, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.text('Subtotal:', pageWidth / 2 + 5, y);
      pdf.text(`Rs.${numericTotal.toFixed(2)}`, pageWidth - 16, y, { align: 'right' });

      y += 6;
      pdf.text('Shipping:', pageWidth / 2 + 5, y);
      pdf.setTextColor(22, 163, 74); // green
      pdf.text('Free', pageWidth - 16, y, { align: 'right' });

      y += 8;
      pdf.setDrawColor(200);
      pdf.line(pageWidth / 2, y, pageWidth - 14, y);
      y += 8;

      pdf.setTextColor(219, 39, 119); // pink
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Amount:', pageWidth / 2 + 5, y);
      pdf.text(`Rs.${numericTotal.toFixed(2)}`, pageWidth - 16, y, { align: 'right' });

      // Footer
      y += 20;
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });

      pdf.save(`Invoice-${order.id}.pdf`);
      toast.success('Invoice downloaded!');
    } catch (err) {
      console.error('Invoice generation error:', err);
      toast.error('Failed to generate invoice.');
    }
  };

  // Send invoice via email
  const handleSendEmail = async () => {
    if (!order.customerEmail) {
      toast.error('No email address available');
      return;
    }

    setSendingEmail(true);
    try {
      await api.sendInvoiceEmail(order.id, order.customerEmail, {
        orderNumber: order.id,
        customerName: order.customerName,
        items: order.items,
        total: numericTotal,
        address: order.address,
        date: order.createdAt,
      });
      toast.success(`Invoice sent to ${order.customerEmail}`);
    } catch (err: any) {
      console.error('Send email error:', err);
      toast.error(err.message || 'Failed to send invoice email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold text-gray-800">Order Placed Successfully!</h1>
        <p className="text-gray-600 font-hand text-xl">Thank you for supporting handmade art.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <button 
          onClick={handleDownloadInvoice}
          className="flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" /> Download Invoice
        </button>
        <button
          onClick={handleSendEmail}
          disabled={sendingEmail}
          className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingEmail ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
          ) : (
            <><Mail className="w-5 h-5" /> Send Invoice to Email</>
          )}
        </button>
        <Link 
          to="/my-orders"
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md"
        >
          <Package className="w-5 h-5" /> View My Orders
        </Link>
        <Link 
          to="/"
          className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors shadow-md"
        >
          <Home className="w-5 h-5" /> Back to Home
        </Link>
      </div>

      {/* Invoice Preview */}
      <div className="flex justify-center">
        <div 
          ref={invoiceRef} 
          className="bg-white p-12 rounded-lg shadow-lg text-left w-full max-w-2xl border border-gray-200"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div className="flex justify-between items-start mb-8 border-b pb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">INVOICE</h2>
              <p className="text-gray-500">Order #{order.id}</p>
              <p className="text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-pink-600">Handmade by You</h3>
              <p className="text-sm text-gray-600">123 Creative Studio</p>
              <p className="text-sm text-gray-600">Artisan Street, Craft City</p>
              <p className="text-sm text-gray-600">support@handmadebyyou.com</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-gray-600 font-bold uppercase text-sm mb-2">Bill To:</h3>
            <p className="font-bold">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p>{order.customerPhone}</p>
            <p>{order.address}</p>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-bold text-gray-600">Item</th>
                <th className="text-center py-3 font-bold text-gray-600">Qty</th>
                <th className="text-right py-3 font-bold text-gray-600">Price</th>
                <th className="text-right py-3 font-bold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item, index) => {
                const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0;
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4">
                      <p className="font-bold">{item.name}</p>
                      {item.customizations && (
                        <p className="text-xs text-gray-500 italic">
                          {item.customizations.text && `Text: "${item.customizations.text}" `}
                          {item.customizations.color && `Color: ${item.customizations.color}`}
                        </p>
                      )}
                    </td>
                    <td className="text-center py-4">{item.quantity}</td>
                    <td className="text-right py-4">₹{itemPrice.toFixed(2)}</td>
                    <td className="text-right py-4 font-bold">₹{(itemPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end border-t-2 border-gray-800 pt-4">
            <div className="w-1/2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">₹{numericTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-pink-600">₹{numericTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}