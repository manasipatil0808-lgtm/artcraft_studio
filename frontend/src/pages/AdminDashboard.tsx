import * as Tabs from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useOrderStore } from "../store/orderStore";
import {
  useProductStore,
  fileToBase64,
  createProductFormData,
} from "../store/productStore";
import type { Product } from "../types";

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  stock_quantity: number;
  customizable: boolean;
}

export function AdminDashboard() {
  const {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    removeProduct,
    updateProduct,
  } = useProductStore();

  const { orders, updateStatus, fetchOrders } = useOrderStore();

  const [selectedTab, setSelectedTab] = useState("products");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    description: "",
    category: "Home Decor",
    stock_quantity: 10,
    customizable: false,
  });

  // Load data on mount
  useEffect(() => {
    fetchProducts(1, 100); // Get all products
    fetchOrders();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "Home Decor",
      stock_quantity: 10,
      customizable: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  // Load product data for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.replace("₹", ""),
      description: product.description || "",
      category: product.category || "Home Decor",
      stock_quantity: product.stock_quantity || 10,
      customizable: product.customizable || false,
    });
    setImagePreview(product.image || null);
    setSelectedTab("products");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      // Prepare product data
      const productData = {
        name: formData.name,
        price: price,
        description: formData.description,
        category: formData.category,
        stock_quantity: formData.stock_quantity,
        customizable: formData.customizable,
      };

      if (editingProduct) {
        // Update existing product
        if (imageFile) {
          // If new image selected, use FormData
          const formDataWithImage = createProductFormData(
            productData,
            imageFile,
          );
          await updateProduct(editingProduct.id, formDataWithImage);
          toast.success("Product updated with new image");
        } else {
          // Update without image
          await updateProduct(editingProduct.id, productData);
          toast.success("Product updated successfully");
        }
      } else {
        // Add new product
        if (imageFile) {
          const formDataWithImage = createProductFormData(
            productData,
            imageFile,
          );
          await addProduct(formDataWithImage);
          toast.success("Product added successfully");
        } else {
          toast.error("Please select a product image");
          return;
        }
      }

      // Refresh products and reset form
      await fetchProducts(1, 100);
      resetForm();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Failed to ${editingProduct ? "update" : "add"} product`,
      );
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await removeProduct(id);
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-display font-bold mb-8 text-gray-800">
        Admin Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs.Root
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
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

        {/* Products Tab */}
        <Tabs.Content
          value="products"
          className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Add/Edit Product Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    placeholder="Enter product name"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter price"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="Home Decor">Home Decor</option>
                    <option value="Wall Art">Wall Art</option>
                    <option value="Ceramics">Ceramics</option>
                    <option value="Wooden Crafts">Wooden Crafts</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {/* Customizable Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.customizable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customizable: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span className="font-bold text-gray-700">
                      This product can be customized
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter product description"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Product Image {!editingProduct && "*"}
                  </label>

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Upload className="w-5 h-5" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {imagePreview && (
                    <div className="mt-4 relative w-48">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </>
                  )}
                </button>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-600 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product Inventory */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold mb-4">
              Product Inventory ({products.length})
            </h2>

            {loading && products.length === 0 ? (
              <div className="text-center py-8">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-left">
                      <th className="p-3 font-bold text-gray-600">Image</th>
                      <th className="p-3 font-bold text-gray-600">Name</th>
                      <th className="p-3 font-bold text-gray-600">Category</th>
                      <th className="p-3 font-bold text-gray-600">Price</th>
                      <th className="p-3 font-bold text-gray-600">Stock</th>
                      <th className="p-3 font-bold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-bold">{product.name}</td>
                        <td className="p-3 text-gray-600">
                          {product.category}
                        </td>
                        <td className="p-3 text-pink-600 font-bold">
                          {product.price}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              product.stock_quantity > 10
                                ? "bg-green-100 text-green-700"
                                : product.stock_quantity > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tabs.Content>

        {/* Orders Tab */}
        <Tabs.Content
          value="orders"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <h2 className="text-2xl font-display font-bold mb-4">
            Customer Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold font-display text-gray-800">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Customer:{" "}
                        <span className="font-bold">{order.customerName}</span>
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-pink-600">
                        {order.total_amount || order.total}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : order.status === "processing"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
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
                    <h4 className="font-bold text-sm text-gray-600 uppercase">
                      Items
                    </h4>
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <span className="font-bold text-gray-800">
                              {item.name}
                            </span>
                            <span className="text-gray-500 ml-2">
                              x {item.quantity}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {item.customizations && (
                          <div className="text-sm bg-purple-50 p-2 rounded border border-purple-100 space-y-1">
                            <p className="font-bold text-purple-700 text-xs uppercase">
                              Customizations:
                            </p>
                            {item.customizations.text && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Text:</span> "
                                {item.customizations.text}"
                              </p>
                            )}
                            {item.customizations.color && (
                              <p className="text-gray-700">
                                <span className="font-semibold">Color:</span>{" "}
                                {item.customizations.color}
                              </p>
                            )}
                            {item.customizations.image && (
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">
                                  Uploaded Image:
                                </p>
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
