import { useForm } from 'react-hook-form';

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order = {
      id: nanoid(),
      customerName: `${data.firstName} ${data.lastName}`,
      customerEmail: data.email,
      customerPhone: data.phone,
      address: `${data.address}, ${data.city} ${data.zip}`,
      items: [...items],
      total: total,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    addOrder(order);
    clearCart();
    setIsProcessing(false);
    toast.success("Order placed successfully!");
    navigate('/order-success', { state: { order } });
  };

  const loggedInUser = localStorage.getItem('handmade-auth-storage');
  if(loggedInUser?.state?.user == null){
    navigate('/login');
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <h1 className="text-4xl font-display font-bold">Checkout</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">First Name</label>
              <input 
                {...register("firstName", { required: "First Name is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last Name</label>
              <input 
                {...register("lastName", { required: "Last Name is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input 
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Phone</label>
              <input 
                {...register("phone", { required: "Phone is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Address</label>
            <input 
              {...register("address", { required: "Address is required" })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">City</label>
              <input 
                {...register("city", { required: "City is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Pin Code</label>
              <input 
                {...register("zip", { required: "Zip Code is required" })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
              />
              {errors.zip && <p className="text-red-500 text-sm">{errors.zip.message}</p>}
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold pt-6">Payment Method</h2>
          <div className="space-y-4">
            <label className="p-4 border-2 border-pink-500 bg-pink-50 rounded-xl flex items-center gap-4 cursor-pointer">
              <input type="radio" name="payment" className="w-6 h-6 text-pink-500 focus:ring-pink-500" defaultChecked />
              <span className="font-bold">Credit / Debit Card (Secure)</span>
            </label>
            <label className="p-4 border-2 border-gray-200 hover:border-pink-300 rounded-xl flex items-center gap-4 cursor-pointer transition-colors">
              <input type="radio" name="payment" className="w-6 h-6 text-pink-500 focus:ring-pink-500" />
              <span className="font-bold">UPI / Net Banking</span>
            </label>
            <label className="p-4 border-2 border-gray-200 hover:border-pink-300 rounded-xl flex items-center gap-4 cursor-pointer transition-colors">
              <input type="radio" name="payment" className="w-6 h-6 text-pink-500 focus:ring-pink-500" />
              <span className="font-bold">Wallets (Paytm, PhonePe)</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Pay'}
          </button>
        </form>
      </div>

      <div className="bg-gray-50 p-8 rounded-3xl h-fit border border-gray-200 sticky top-24">
        <h2 className="text-2xl font-display font-bold mb-6">Order Summary</h2>
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
          {items.map(item => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-pink-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 mt-2">
            <span>Total</span>
            <span className="text-pink-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}