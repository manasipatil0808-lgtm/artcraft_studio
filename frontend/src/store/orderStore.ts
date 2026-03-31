import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

const API_BASE_URL = "http://localhost:5000";

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  image_url: string;
  category?: string;
  customizable?: boolean;
  quantity: number;
  customizations?: {
    text?: string;
    color?: string;
    image?: string;
    image_url: string;
    [key: string]: any;
  };
}

export interface Order {
  id: string | number;
  order_number?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  shipping_address?: string;
  items: OrderItem[];
  total: number;
  total_amount?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status?: "pending" | "completed" | "failed";
  payment_method?: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;

  // Fetch actions
  fetchOrders: () => Promise<void>;
  fetchUserOrders: () => Promise<void>;
  fetchOrderDetails: (id: string | number) => Promise<Order | null>;

  // Order actions
  createOrder: (
    shipping_address: string,
    payment_method?: string,
  ) => Promise<any>;
  updateStatus: (id: string | number, status: Order["status"]) => Promise<void>;
  cancelOrder: (id: string | number) => Promise<void>;

  // Local state management
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  clearError: () => void;
  resetState: () => void;
}

// Helper to convert backend order to frontend format
const formatOrderFromBackend = (backendOrder: any): Order => {
  // Parse total amount if it's a string with ₹ symbol
  let totalAmount = backendOrder.total_amount || backendOrder.total;
  if (typeof totalAmount === "string" && totalAmount.startsWith("₹")) {
    totalAmount = parseFloat(totalAmount.replace("₹", ""));
  }

  // Format items
  // Helper to parse price strings that may have ₹ prefix
  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      return parseFloat(price.replace(/[₹,]/g, "")) || 0;
    }
    return 0;
  };

  const items = (backendOrder.OrderItems || backendOrder.items || []).map(
    (item: any) => {
      // Resolve image_url: prefer base64, then resolve relative paths
      let resolvedImageUrl = item.Product?.image_url || item.image_url || '';
      if (resolvedImageUrl && !resolvedImageUrl.startsWith('http') && !resolvedImageUrl.startsWith('data:')) {
        resolvedImageUrl = `${API_BASE_URL}${resolvedImageUrl}`;
      }

      let resolvedImage = item.Product?.image || item.image || '';
      if (resolvedImage === '[IMAGE_STORED]') {
        resolvedImage = '';
      }

      return {
        id: item.product_id || item.id,
        name: item.Product?.name || item.name || "Product",
        price: parsePrice(item.price),
        quantity: item.quantity || 1,
        image: resolvedImage || resolvedImageUrl,
        image_url: resolvedImageUrl,
        description: item.Product?.description,
        category: item.Product?.category,
        customizations: item.customizations || {},
      };
    },
  );

  return {
    id: backendOrder.id,
    order_number: backendOrder.order_number,
    customerName:
      backendOrder.User?.name || backendOrder.customerName || "Customer",
    customerEmail: backendOrder.User?.email || backendOrder.customerEmail || "",
    customerPhone: backendOrder.customerPhone || "",
    address: backendOrder.shipping_address || backendOrder.address,
    shipping_address: backendOrder.shipping_address,
    items,
    total: totalAmount,
    total_amount: backendOrder.total_amount,
    status: backendOrder.status || "pending",
    payment_status: backendOrder.payment_status || "pending",
    payment_method: backendOrder.payment_method,
    createdAt:
      backendOrder.created_at ||
      backendOrder.createdAt ||
      new Date().toISOString(),
    updatedAt: backendOrder.updated_at || backendOrder.updatedAt,
  };
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, _get) => ({
      orders: [],
      loading: false,
      error: null,
      currentOrder: null,

      // Fetch all orders (Admin only)
      fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.getAllOrders();

          // Format orders from backend
          const formattedOrders = response.map(formatOrderFromBackend);

          set({
            orders: formattedOrders,
            loading: false,
          });
        } catch (error: any) {
          console.error("Fetch orders error:", error);
          set({
            error: error.message || "Failed to fetch orders",
            loading: false,
          });
        }
      },

      // Fetch user's orders
      fetchUserOrders: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.getMyOrders();

          // Format orders from backend
          const formattedOrders = response.map(formatOrderFromBackend);

          set({
            orders: formattedOrders,
            loading: false,
          });
        } catch (error: any) {
          console.error("Fetch user orders error:", error);
          set({
            error: error.message || "Failed to fetch your orders",
            loading: false,
          });
        }
      },

      // Fetch single order details
      fetchOrderDetails: async (id: string | number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.getOrderDetails(Number(id));
          const formattedOrder = formatOrderFromBackend(response);

          set({
            currentOrder: formattedOrder,
            loading: false,
          });

          return formattedOrder;
        } catch (error: any) {
          console.error("Fetch order details error:", error);
          set({
            error: error.message || "Failed to fetch order details",
            loading: false,
          });
          return null;
        }
      },

      // Create new order
      createOrder: async (
        shipping_address: string,
        payment_method: string = "cod",
      ) => {
        set({ loading: true, error: null });
        try {
          const response = await api.placeOrder(
            shipping_address,
            payment_method,
          );

          // Format the new order if present
          if (response.order) {
            const newOrder = formatOrderFromBackend(response.order);
            set((state) => ({
              orders: [newOrder, ...state.orders],
              loading: false,
            }));
          } else {
            set({ loading: false });
          }

          return response;
        } catch (error: any) {
          console.error("Create order error:", error);
          set({
            error: error.message || "Failed to create order",
            loading: false,
          });
          throw error;
        }
      },

      // Update order status (Admin only)
      updateStatus: async (id: string | number, status: Order["status"]) => {
        set({ loading: true, error: null });
        try {
          // Map status to backend format if needed
          const backendStatus = status;

          await api.updateOrderStatus(Number(id), backendStatus);

          // Update local state
          const numId = Number(id);
          set((state) => ({
            orders: state.orders.map((order) =>
              Number(order.id) === numId ? { ...order, status } : order,
            ),
            currentOrder:
              state.currentOrder && Number(state.currentOrder.id) === numId
                ? { ...state.currentOrder, status }
                : state.currentOrder,
            loading: false,
          }));
        } catch (error: any) {
          console.error("Update order status error:", error);
          set({
            error: error.message || "Failed to update order status",
            loading: false,
          });
          throw error;
        }
      },

      // Cancel order (User)
      cancelOrder: async (id: string | number) => {
        set({ loading: true, error: null });
        try {
          await api.cancelOrder(Number(id));

          // Update local state
          const numId = Number(id);
          set((state) => ({
            orders: state.orders.map((order) =>
              Number(order.id) === numId
                ? { ...order, status: "cancelled" }
                : order,
            ),
            currentOrder:
              state.currentOrder && Number(state.currentOrder.id) === numId
                ? { ...state.currentOrder, status: "cancelled" }
                : state.currentOrder,
            loading: false,
          }));
        } catch (error: any) {
          console.error("Cancel order error:", error);
          set({
            error: error.message || "Failed to cancel order",
            loading: false,
          });
          throw error;
        }
      },

      // Local state management
      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          orders: [],
          loading: false,
          error: null,
          currentOrder: null,
        }),
    }),
    {
      name: "artcraft-order-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields (don't persist loading/error states)
      partialize: (state) => ({
        orders: state.orders.map((order) => ({
          ...order,
          // Don't store large data in localStorage if not needed
          items: order.items.map((item) => ({
            ...item,
            image: item.image ? "[IMAGE_STORED]" : null,
          })),
        })),
      }),
    },
  ),
);
