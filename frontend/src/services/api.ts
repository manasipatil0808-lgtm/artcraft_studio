// frontend/src/services/api.ts

const API_BASE_URL = 'http://localhost:5000/api';

// Simple types for data structures
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    image_url: string;
    stock_quantity: number;
}

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    Product: {
        name: string;
        price: string;
        image_url: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: string;
    status: string;
    created_at: string;
}

// Simple API object with methods
const api = {
    // Helper to get token
    getToken: () => localStorage.getItem('token'),
    
    // Helper to set token
    setToken: (token: string) => {
        localStorage.setItem('token', token);
    },
    
    // Helper to remove token
    removeToken: () => {
        localStorage.removeItem('token');
    },
    
    // Helper for headers
    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
    }),

    // Auth endpoints
    register: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        if (data.token) api.setToken(data.token);
        return data;
    },

    login: async (email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        if (data.token) api.setToken(data.token);
        return data;
    },

    logout: () => {
        api.removeToken();
    },

    getCurrentUser: async () => {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to get user');
        return data;
    },

    // Product endpoints
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_BASE_URL}/products?${queryString}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
        return data;
    },

    getProduct: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch product');
        return data;
    },

    getCategories: async () => {
        const res = await fetch(`${API_BASE_URL}/products/categories`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
        return data;
    },

    // Admin product endpoints
    createProduct: async (productData: any) => {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create product');
        return data;
    },

    updateProduct: async (id: number, productData: any) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: api.getHeaders(),
            body: JSON.stringify(productData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update product');
        return data;
    },

    deleteProduct: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete product');
        return data;
    },

    // Cart endpoints
    getCart: async () => {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
        return data;
    },

    addToCart: async (productId: number, quantity: number = 1) => {
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ productId, quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
        return data;
    },

    updateCartItem: async (itemId: number, quantity: number) => {
        const res = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: api.getHeaders(),
            body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update cart');
        return data;
    },

    removeFromCart: async (itemId: number) => {
        const res = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to remove from cart');
        return data;
    },

    clearCart: async () => {
        const res = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to clear cart');
        return data;
    },

    // Order endpoints
    placeOrder: async (shipping_address: string, payment_method: string = 'cod') => {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ shipping_address, payment_method })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to place order');
        return data;
    },

    getMyOrders: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
        return data;
    },

    getOrderDetails: async (orderId: number) => {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch order');
        return data;
    },

    cancelOrder: async (orderId: number) => {
        const res = await fetch(`${API_BASE_URL}/orders/cancel/${orderId}`, {
            method: 'PUT',
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
        return data;
    },

    // Admin order endpoints
    getAllOrders: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/admin/all`, {
            headers: api.getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
        return data;
    },

    updateOrderStatus: async (orderId: number, status: string, payment_status?: string) => {
        const res = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
            method: 'PUT',
            headers: api.getHeaders(),
            body: JSON.stringify({ status, payment_status })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update order');
        return data;
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};

export default api;