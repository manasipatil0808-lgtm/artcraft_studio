import { useLocation, Navigate, Link } from 'react-router';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, CheckCircle, Home, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../types';

export function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order as Order;
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!order) {
    return <Navigate to="/" />;
  }

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Invoice-${order.id}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate invoice.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold text-gray-800">Order Placed Successfully!</h1>
        <p className="text-gray-600 font-hand text-xl">Thank you for supporting handmade art.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={handleDownloadInvoice}
          className="flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" /> Download Invoice
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

      {/* Invoice View */}
      <div className="flex justify-center">
        <div 
          ref={invoiceRef} 
          className="bg-white p-12 rounded-lg shadow-lg text-left w-full max-w-2xl border border-gray-200"
          style={{ fontFamily: 'Arial, sans-serif' }} // Reset font for professional invoice look
        >
          <div className="flex justify-between items-start mb-8 border-b pb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">INVOICE</h2>
              <p className="text-gray-500">Order #{order.id}</p>
              <p className="text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
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
              {order.items.map((item, index) => (
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
                  <td className="text-right py-4">${item.price.toFixed(2)}</td>
                  <td className="text-right py-4 font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t-2 border-gray-800 pt-4">
            <div className="w-1/2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-pink-600">${order.total.toFixed(2)}</span>
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