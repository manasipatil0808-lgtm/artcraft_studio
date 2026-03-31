
import { Link } from 'react-router';
import { Package, Clock, Truck, CheckCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export function MyOrders() {
  const { orders, fetchUserOrders, loading } = useOrderStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log(orders)
  // Fetch orders from backend on mount (backend already filters by user_id)
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    }
  }, [isAuthenticated, fetchUserOrders]);

  // Backend getUserOrders already filters by user_id, no client-side filter needed
  const userOrders = orders;
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-3xl font-display text-gray-800 mb-4">Please Sign In</h2>
        <p className="text-gray-600 mb-8 font-hand text-xl">You need to be logged in to view your orders.</p>
        <Link
          to="/login"
          className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-3xl font-display text-gray-800 mb-4">No Orders Yet</h2>
        <p className="text-gray-600 mb-8 font-hand text-xl">You haven't placed any orders yet. Start shopping!</p>
        <Link
          to="/shop"
          className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-md"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 text-lg font-hand">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {userOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Order ID</p>
                  <p className="text-lg font-bold font-mono">#{String(order.id).slice(0, 12).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">Order Date</p>
                  <p className="text-lg font-bold">{new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Status</p>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getStatusColor(order.status)} font-bold uppercase text-sm`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">Total Amount</p>
                  <p className="text-2xl font-bold text-pink-600">₹{typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 font-display">Items</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img 
                        src={(() => {
                          const url = item?.image_url || item?.image || '';
                          if (url && !url.startsWith('http') && !url.startsWith('data:') && url !== '[IMAGE_STORED]') {
                            return `http://localhost:5000${url}`;
                          }
                          return url || 'https://placehold.co/80x80?text=No+Image';
                        })()}
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      {item.customizations && (
                        <div className="mt-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-sm">
                          {item.customizations.text && (
                            <p><span className="font-bold">Text:</span> {item.customizations.text}</p>
                          )}
                          {item.customizations.color && (
                            <p><span className="font-bold">Color:</span> {item.customizations.color}</p>
                          )}
                          {item.customizations.image && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold">Image:</span>
                              <img src={item.customizations.image} alt="Custom" className="w-8 h-8 rounded border object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-pink-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">₹{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold mb-2">Shipping Address</h4>
                <p className="text-gray-600">{order.customerName}</p>
                <p className="text-gray-600">{order.address}</p>
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">Email:</span> {order.customerEmail}
                </p>
                <p className="text-gray-600">
                  <span className="font-bold">Phone:</span> {order.customerPhone}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
