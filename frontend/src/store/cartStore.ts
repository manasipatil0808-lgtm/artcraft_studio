// src/store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customizations?: {
    text?: string;
    color?: string;
    image?: string;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;

  // Fetch actions
  fetchCart: () => Promise<void>;

  // Cart actions
  addItem: (
    product: any,
    quantity: number,
    customizations?: any,
  ) => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Local helpers
  calculateTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      total: 0,

      // Calculate total from items
      calculateTotal: () => {
        const items = get().items;
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      // Fetch cart from backend
      fetchCart: async () => {
        // Only fetch if user is logged in
        if (!api.isLoggedIn()) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const cartData = await api.getCart();

          if (cartData && cartData.items) {
            const localItems = cartData.items.map((item: any) => ({
              id: item.id?.toString() || Date.now().toString(),
              productId: item.product_id,
              name: item.Product?.name || "Product",
              price: parseFloat(item.Product?.price) || 0,
              image: item.Product?.image_url || item.Product?.image || "",
              quantity: item.quantity,
              customizations: item.customizations || {},
            }));

            const total = localItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0,
            );

            set({
              items: localItems,
              total,
              loading: false,
            });
          } else {
            set({ items: [], total: 0, loading: false });
          }
        } catch (error: any) {
          console.error("Fetch cart error:", error);
          set({
            error: error.message || "Failed to fetch cart",
            loading: false,
          });
        }
      },

      // Add item to cart
      addItem: async (product, quantity, customizations) => {
        set({ loading: true, error: null });

        try {
          // Check if user is logged in
          if (!api.isLoggedIn()) {
            set({ error: "Please login to add items to cart", loading: false });
            return false;
          }

          // Get product ID (handle both string and number)
          const productId = product.id || product.productId;

          if (!productId) {
            throw new Error("Product ID is required");
          }

          console.log("Adding to cart:", {
            productId,
            quantity,
            customizations,
          });

          // Send to backend
          const response = await api.addToCart(productId, quantity);
          console.log("Add to cart response:", response);

          // Fetch updated cart from backend
          await get().fetchCart();

          set({ loading: false });
          return true;
        } catch (error: any) {
          console.error("Add to cart error:", error);
          set({
            error: error.message || "Failed to add item to cart",
            loading: false,
          });
          return false;
        }
      },

      // Remove item from cart
      removeItem: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // Send to backend
          await api.removeFromCart(parseInt(id));

          // Fetch updated cart
          await get().fetchCart();
        } catch (error: any) {
          console.error("Remove item error:", error);
          set({
            error: error.message || "Failed to remove item",
            loading: false,
          });
          throw error;
        }
      },

      // Update quantity
      updateQuantity: async (id: string, quantity: number) => {
        if (quantity < 1) return;

        set({ loading: true, error: null });
        try {
          // Send to backend
          await api.updateCartItem(parseInt(id), quantity);

          // Fetch updated cart
          await get().fetchCart();
        } catch (error: any) {
          console.error("Update quantity error:", error);
          set({
            error: error.message || "Failed to update quantity",
            loading: false,
          });
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          // Send to backend
          await api.clearCart();

          // Clear local state
          set({ items: [], total: 0, loading: false });
        } catch (error: any) {
          console.error("Clear cart error:", error);
          set({
            error: error.message || "Failed to clear cart",
            loading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "artcraft-cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist cart when user is logged out (as backup)
      partialize: (state) => ({
        items: state.items,
        total: state.total,
      }),
    },
  ),
);

// Initialize cart on app start
if (typeof window !== "undefined") {
  // Check if user is logged in and fetch cart
  const checkAuthAndFetchCart = () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("User logged in, fetching cart...");
      useCartStore.getState().fetchCart();
    }
  };

  // Run immediately
  checkAuthAndFetchCart();

  // Also run when storage changes (for multi-tab support)
  window.addEventListener("storage", (e) => {
    if (e.key === "token") {
      checkAuthAndFetchCart();
    }
  });
}
