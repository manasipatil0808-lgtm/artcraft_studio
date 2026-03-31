import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export function Checkout() {
  const { items, total, fetchCart } = useCartStore();
  const { createOrder, loading: orderLoading } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CheckoutForm>();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Check if user is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      if (user.name) {
        const nameParts = user.name.split(' ');
        setValue('firstName', nameParts[0] || '');
        setValue('lastName', nameParts.slice(1).join(' ') || '');
      }
    }
  }, [user, setValue]);

  if (items.length === 0 || !isAuthenticated) {
    return null;
  }

  // Calculate total in rupees
  const getNumericTotal = () => {
    if (typeof total === 'string' && (total as string).startsWith('₹')) {
      return parseFloat((total as string).replace('₹', ''));
    }
    return typeof total === 'number' ? total : 0;
  };

  const numericTotal = getNumericTotal();

  // Open Razorpay checkout modal
  const openRazorpayCheckout = (paymentData: any, orderId: number) => {
    const options = {
      key: paymentData.key_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'ArtCraft Studio',
      description: 'Order Payment',
      order_id: paymentData.razorpay_order_id,
      handler: async (response: any) => {
        try {
          const verifyResponse = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_id: orderId,
          });

          await fetchCart();
          toast.success('Payment successful! Order placed.');
          navigate('/order-success', {
            state: {
              order: {
                id: verifyResponse.order.order_number || verifyResponse.order.id,
                customerName: user?.name || '',
                customerEmail: user?.email || '',
                customerPhone: '',
                address: '',
                items: items.map(item => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  customizations: item.customizations,
                })),
                total: numericTotal,
                status: 'processing',
                createdAt: new Date().toISOString(),
              }
            }
          });
        } catch (error: any) {
          toast.error(error.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#ec4899',
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
          toast.error('Payment was cancelled');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    try {
      const shipping_address = `${data.address}, ${data.city}, ${data.state} - ${data.zip}`;
      
      const response = await createOrder(shipping_address, paymentMethod);
      
      if (paymentMethod === 'razorpay' && response.payment?.razorpay_order_id) {
        openRazorpayCheckout(response.payment, response.order.id);
        return;
      }
      
      // COD order — show success
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate('/order-success', {
        state: {
          order: {
            id: response.order.order_number || response.order.id,
            customerName: `${data.firstName} ${data.lastName}`,
            customerEmail: data.email,
            customerPhone: data.phone,
            address: shipping_address,
            items: items.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              customizations: item.customizations,
            })),
            total: numericTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }
        }
      });
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
      <div className="space-y-8">
        <h1 className="text-4xl font-display font-bold">Checkout</h1>
        
        {user && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800">Logged in as {user.name}</p>
              <p className="text-sm text-green-600">{user.email}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">First Name *</label>
              <input 
                {...register("firstName", { required: "First name is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last Name *</label>
              <input 
                {...register("lastName", { required: "Last name is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Email *</label>
              <input 
                {...register("email", { 
                  required: "Email is required", 
                  pattern: { 
                    value: /^\S+@\S+\.\S+$/, 
                    message: "Invalid email format" 
                  } 
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Phone *</label>
              <input 
                {...register("phone", { 
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number"
                  }
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Address *</label>
            <input 
              {...register("address", { required: "Address is required" })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              placeholder="Street address, building, apartment"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">City *</label>
              <input 
                {...register("city", { required: "City is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Mumbai"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">State *</label>
              <input 
                {...register("state", { required: "State is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Maharashtra"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Pin Code *</label>
            <input 
              {...register("zip", { 
                required: "Pin code is required",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Please enter a valid 6-digit pin code"
                }
              })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              placeholder="400001"
            />
            {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>}
          </div>

          <h2 className="text-2xl font-display font-bold pt-6">Payment Method</h2>
          
          <div className="space-y-4">
            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${
              paymentMethod === 'cod' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-pink-300'
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="w-5 h-5 text-pink-500 focus:ring-pink-500"
              />
              <Banknote className="w-6 h-6 text-green-600" />
              <div>
                <span className="font-bold block">Cash on Delivery (COD)</span>
                <span className="text-sm text-gray-600">Pay when you receive your order</span>
              </div>
            </label>
            
            <label className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${
              paymentMethod === 'razorpay' 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200 hover:border-pink-300'
            }`}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="w-5 h-5 text-pink-500 focus:ring-pink-500"
              />
              <CreditCard className="w-6 h-6 text-blue-600" />
              <div>
                <span className="font-bold block">Pay Online</span>
                <span className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking via Razorpay</span>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing || orderLoading}
            className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing || orderLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order • ₹${numericTotal.toFixed(2)}`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By placing your order, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-8 rounded-3xl h-fit border border-gray-200 sticky top-24">
        <h2 className="text-2xl font-display font-bold mb-6">Order Summary</h2>
        
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-4 last:border-0">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=No+Image';
                  }}
                />
              </div>
              <div className="flex-grow">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                {item.customizations && (
                  <div className="text-xs text-gray-400">
                    {item.customizations.text && <span>"{item.customizations.text}" </span>}
                    {item.customizations.color && <span>• {item.customizations.color}</span>}
                  </div>
                )}
                <p className="text-pink-600 font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold">₹{numericTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 mt-3">
            <span>Total</span>
            <span className="text-pink-600">₹{numericTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-bold mb-1">Estimated Delivery</p>
          <p className="text-sm text-gray-600">
            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}