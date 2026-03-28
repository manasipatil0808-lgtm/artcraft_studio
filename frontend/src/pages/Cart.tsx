import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '../store/cartStore';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    total,
    loading,
    error,
    fetchCart,
    clearCart
  } = useCartStore();
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this item from your cart?')) return;
    
    setIsUpdating(true);
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return;
    if (!confirm('Clear your entire cart?')) return;
    
    setIsUpdating(true);
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
    } finally {
      setIsUpdating(false);
    }
  };

  // Extract numeric total
  const getNumericTotal = () => {
    if (typeof total === 'string' && total.startsWith('₹')) {
      return parseFloat(total.replace('₹', ''));
    }
    return typeof total === 'number' ? total : 0;
  };

  const numericTotal = getNumericTotal();

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-600 font-hand text-lg">Loading your cart...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Oops! Something went wrong</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => fetchCart()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-display text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 font-hand text-xl">
            Looks like you haven't added any handmade treasures yet.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-md"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-display font-bold">
          Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {items.map((item) => (
          <motion.div 
            layout
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 border-b border-gray-100 last:border-0 flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            {/* Product Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            
            {/* Product Details */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold font-display">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                </div>
                <span className="text-xl font-bold text-pink-600">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              
              {/* Customizations */}
              {item.customizations && Object.keys(item.customizations).length > 0 && (
                <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {item.customizations.text && (
                    <p><span className="font-bold">Text:</span> "{item.customizations.text}"</p>
                  )}
                  {item.customizations.color && (
                    <p><span className="font-bold">Color:</span> {item.customizations.color}</p>
                  )}
                  {item.customizations.image && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold">Image:</span> 
                      <img 
                        src={item.customizations.image} 
                        alt="Custom" 
                        className="w-8 h-8 rounded border object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={isUpdating || item.quantity <= 1}
                    className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                    className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isUpdating}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Cart Summary */}
        <div className="p-8 bg-gray-50">
          <div className="max-w-md ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">₹{numericTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-2xl font-bold border-t border-gray-200 pt-4 mt-2">
                <span>Total:</span>
                <span className="text-pink-600">₹{numericTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Link 
                to="/shop"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition-colors font-bold"
              >
                Continue Shopping
              </Link>
              
              <button
                onClick={() => navigate('/checkout')}
                disabled={items.length === 0 || isUpdating}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>We accept all major payment methods</p>
              <div className="flex justify-center gap-3 mt-2">
                <span className="px-2 py-1 bg-white rounded border text-xs">Card</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">UPI</span>
                <span className="px-2 py-1 bg-white rounded border text-xs">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}