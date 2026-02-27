import * as Tabs from '@radix-ui/react-tabs';

import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Plus, Trash2, Edit, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import type { Product } from '../types';

export function AdminDashboard() {
  const { products, addProduct, removeProduct, updateProduct } = useProductStore();
  const { orders, updateStatus } = useOrderStore();
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    category: 'General',
    customizable: false
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Please fill in required fields");
      return;
    }
    
    addProduct({
      id: nanoid(),
      name: newProduct.name,
      price: Number(newProduct.price),
      description: newProduct.description || '',
      image: newProduct.image || 'https://via.placeholder.com/150',
      category: newProduct.category || 'General',
      customizable: newProduct.customizable || false
    } as Product);
    
    setNewProduct({ name: '', price: 0, description: '', image: '', category: 'General', customizable: false });
    toast.success("Product added successfully");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-display font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <Tabs.Root defaultValue="products" className="w-full">
        <Tabs.List className="flex border-b-2 border-gray-200 mb-8 bg-white rounded-t-xl overflow-hidden shadow-sm">
          <Tabs.Trigger 
            value="products" 
            className="flex-1 px-6 py-4 font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 data-[state=active]:text-pink-600 data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-pink-500 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" /> Manage Products
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="orders" 
            className="flex-1 px-6 py-4 font-bold text-gray-500 hover:text-pink-600 hover:bg-pink-50 data-[state=active]:text-pink-600 data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-pink-500 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" /> Manage Orders
          </Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="products" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold mb-4">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                placeholder="Product Name" 
                className="p-2 border rounded-lg"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Price" 
                className="p-2 border rounded-lg"
                value={newProduct.price || ''}
                onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
              />
              <input 
                placeholder="Image URL" 
                className="p-2 border rounded-lg"
                value={newProduct.image}
                onChange={e => setNewProduct({...newProduct, image: e.target.value})}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newProduct.customizable}
                  onChange={e => setNewProduct({...newProduct, customizable: e.target.checked})}
                  className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500"
                />
                <span className="font-bold text-gray-700">Customizable?</span>
              </label>
              <textarea 
                placeholder="Description" 
                className="p-2 border rounded-lg md:col-span-2"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            <button 
              onClick={handleAddProduct}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Product
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold mb-4">Product Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-left">
                    <th className="p-3 font-bold text-gray-600">Image</th>
                    <th className="p-3 font-bold text-gray-600">Name</th>
                    <th className="p-3 font-bold text-gray-600">Price</th>
                    <th className="p-3 font-bold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                      </td>
                      <td className="p-3 font-bold">{product.name}</td>
                      <td className="p-3 text-pink-600 font-bold">${product.price.toFixed(2)}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-display font-bold mb-4">Customer Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold font-display text-gray-800">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Customer: <span className="font-bold">{order.customerName}</span></p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-pink-600">${order.total.toFixed(2)}</span>
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as any)}
                        className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-gray-600 uppercase">Items</h4>
                    {order.items.map((item, idx) => (
                      <div key={`${order.id}-${item.id}-${idx}`} className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-bold text-gray-800">{item.name}</span>
                            <span className="text-gray-500 ml-2">x {item.quantity}</span>
                          </div>
                          <span className="font-mono font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.customizations && (
                          <div className="text-sm bg-purple-50 p-2 rounded border border-purple-100 space-y-1">
                            <p className="font-bold text-purple-700 text-xs uppercase">Customizations:</p>
                            {item.customizations.text && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Text:</span> "{item.customizations.text}"
                              </p>
                            )}
                            {item.customizations.color && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Color:</span> {item.customizations.color}
                              </p>
                            )}
                            {item.customizations.image && (
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Uploaded Image:</p>
                                <img 
                                  src={item.customizations.image} 
                                  alt="Custom" 
                                  className="w-20 h-20 object-cover rounded border border-gray-300"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}