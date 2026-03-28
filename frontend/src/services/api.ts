// frontend/src/services/api.ts

const API_BASE_URL = "http://localhost:5000/api";

// Simple API object with methods
const api = {
  // Helper to get token
  getToken: () => localStorage.getItem("token"),

  // Helper to set token
  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  // Helper to remove token
  removeToken: () => {
    localStorage.removeItem("token");
  },

  // Helper for headers
  getHeaders: () => ({
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  }),

  // Auth endpoints
  register: async (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    if (data.token) api.setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    if (data.token) api.setToken(data.token);
    return data;
  },

  logout: () => {
    api.removeToken();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to get user");
    return data;
  },

  // Product endpoints
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE_URL}/products?${queryString}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch products");
    return data;
  },

  getProduct: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch product");
    return data;
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch categories");
    return data;
  },

  // Admin product endpoints
  createProduct: async (productData: any) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: api.getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create product");
    return data;
  },

  updateProduct: async (id: number, productData: any) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: api.getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update product");
    return data;
  },

  deleteProduct: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete product");
    return data;
  },
  addToCart: async (productId: number, quantity: number = 1) => {
    console.log("API: Adding to cart", { productId, quantity });

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login to add items to cart");
    }

    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to add to cart");
    }
    return data;
  },

  // Get cart
  getCart: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return { items: [] };
    }

    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch cart");
    }
    return data;
  },

  // Update cart item
  updateCartItem: async (itemId: number, quantity: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update cart");
    }
    return data;
  },

  // Remove from cart
  removeFromCart: async (itemId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to remove from cart");
    }
    return data;
  },

  // Clear cart
  clearCart: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to clear cart");
    }
    return data;
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  // Order endpoints
  // In api.ts - Update placeOrder method

  placeOrder: async (
    shipping_address: string,
    payment_method: string = "cod",
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login to place order");
    }

    console.log("API: Placing order", { shipping_address, payment_method });

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping_address, // Must match backend field name
        payment_method, // Must match backend field name
      }),
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (!res.ok) {
      // Handle validation errors
      if (data.errors) {
        const errorMessages = data.errors.map((err: any) => err.msg).join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(data.message || "Failed to place order");
    }

    return data;
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
    return data;
  },

  getOrderDetails: async (orderId: number) => {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch order");
    return data;
  },

  cancelOrder: async (orderId: number) => {
    const res = await fetch(`${API_BASE_URL}/orders/cancel/${orderId}`, {
      method: "PUT",
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to cancel order");
    return data;
  },

  // Admin order endpoints
  getAllOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/admin/all`, {
      headers: api.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
    return data;
  },

  updateOrderStatus: async (
    orderId: number,
    status: string,
    payment_status?: string,
  ) => {
    const res = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
      method: "PUT",
      headers: api.getHeaders(),
      body: JSON.stringify({ status, payment_status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update order");
    return data;
  },

  // Add to your api object in api.ts

  // Product endpoints with image support
  createProductWithImage: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/products/with-image`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create product");
    return data;
  },

  updateProductWithImage: async (id: number, formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}/with-image`, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update product");
    return data;
  },
  // Razorpay payment verification
  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: number;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login to verify payment");
    }

    const res = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Payment verification failed");
    }
    return data;
  },

  // Send invoice email
  sendInvoiceEmail: async (orderId: string, email: string, invoiceData: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login to send invoice");
    }

    const res = await fetch(`${API_BASE_URL}/orders/send-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, email, invoiceData }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to send invoice email");
    }
    return data;
  },
};

export default api;
