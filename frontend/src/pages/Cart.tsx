import { Link } from 'react-router';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '../store/cartStore';

export function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-display text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8 font-hand text-xl">Looks like you haven't added any handmade treasures yet.</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-md"
        >
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold mb-8">Your Cart ({items.length} items)</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {items.map((item) => (
          <motion.div 
            layout
            key={`${item.id}-${JSON.stringify(item.customizations)}`}
            className="p-6 border-b border-gray-100 last:border-0 flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold font-display">{item.name}</h3>
                <span className="text-lg font-bold text-pink-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              
              {item.customizations && (
                <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {item.customizations.text && <p><span className="font-bold">Text:</span> {item.customizations.text}</p>}
                  {item.customizations.color && <p><span className="font-bold">Color:</span> {item.customizations.color}</p>}
                  {item.customizations.image && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold">Image:</span> 
                      <img src={item.customizations.image} alt="Custom" className="w-8 h-8 rounded border object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-white rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="p-8 bg-gray-50 flex flex-col items-end gap-4">
          <div className="flex justify-between w-full md:w-1/3 text-lg">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full md:w-1/3 text-lg">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-bold text-green-600">Free</span>
          </div>
          <div className="flex justify-between w-full md:w-1/3 text-2xl font-bold border-t border-gray-200 pt-4 mt-2">
            <span>Total:</span>
            <span className="text-pink-600">${total.toFixed(2)}</span>
          </div>
          
          <Link 
            to="/checkout"
            className="w-full md:w-1/3 mt-4 flex items-center justify-center gap-2 bg-gray-800 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors font-bold shadow-lg"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}