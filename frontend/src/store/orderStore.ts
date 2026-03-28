import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../services/api";

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  customizable?: boolean;
  quantity: number;
  customizations?: {
    text?: string;
    color?: string;
    image?: string;
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
  createOrder: (shipping_address: string, payment_method?: string) => Promise<any>;
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
  const items = (backendOrder.OrderItems || backendOrder.items || []).map(
    (item: any) => ({
      id: item.product_id || item.id,
      name: item.Product?.name || item.name || "Product",
      price: parseFloat(item.price) || 0,
      quantity: item.quantity || 1,
      image: item.Product?.image_url || item.image,
      description: item.Product?.description,
      category: item.Product?.category,
      customizations: item.customizations || {},
    }),
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
    (set, get) => ({
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
      createOrder: async (shipping_address: string, payment_method: string = "cod") => {
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
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === id ? { ...order, status } : order,
            ),
            currentOrder:
              state.currentOrder?.id === id
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
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === id ? { ...order, status: "cancelled" } : order,
            ),
            currentOrder:
              state.currentOrder?.id === id
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

// Optional: Demo data for initial development
// export const demoOrders: Order[] = [
//   {
//     id: 'demo001',
//     order_number: 'ORD-DEMO-001',
//     customerName: 'Demo User',
//     customerEmail: 'demo@example.com',
//     customerPhone: '+1 (555) 123-4567',
//     address: '123 Craft Street, Artisan City, AC 12345',
//     shipping_address: '123 Craft Street, Artisan City, AC 12345',
//     items: [
//       {
//         id: '1',
//         name: 'Custom Mandala Art Canvas',
//         price: 45.99,
//         description: 'Beautiful handcrafted mandala art',
//         image: 'https://images.unsplash.com/photo-1761034036989-24640be78e90',
//         category: 'wall-art',
//         customizable: true,
//         quantity: 1,
//         customizations: {
//           text: 'Peace & Harmony',
//           color: 'Purple & Gold'
//         }
//       },
//       {
//         id: '2',
//         name: 'Handmade Bookmark Set',
//         price: 12.99,
//         description: 'Set of 3 artistic bookmarks',
//         image: 'https://images.unsplash.com/photo-1760269720423-6d2d6fa492b0',
//         category: 'bookmarks',
//         customizable: true,
//         quantity: 2
//       }
//     ],
//     total: 71.97,
//     status: 'delivered',
//     payment_status: 'completed',
//     payment_method: 'cod',
//     createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
//   },
//   {
//     id: 'demo002',
//     order_number: 'ORD-DEMO-002',
//     customerName: 'Demo User',
//     customerEmail: 'demo@example.com',
//     customerPhone: '+1 (555) 123-4567',
//     address: '123 Craft Street, Artisan City, AC 12345',
//     shipping_address: '123 Craft Street, Artisan City, AC 12345',
//     items: [
//       {
//         id: '3',
//         name: 'Custom Phone Case',
//         price: 24.99,
//         description: 'Personalized phone case with your design',
//         image: 'https://images.unsplash.com/photo-1743670827800-61375c99e7a7',
//         category: 'phone-cases',
//         customizable: true,
//         quantity: 1,
//         customizations: {
//           text: 'Sarah M.',
//           color: 'Rose Gold'
//         }
//       }
//     ],
//     total: 24.99,
//     status: 'shipped',
//     payment_status: 'completed',
//     payment_method: 'supabase',
//     createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
//   },
//   {
//     id: 'demo003',
//     order_number: 'ORD-DEMO-003',
//     customerName: 'Demo User',
//     customerEmail: 'demo@example.com',
//     customerPhone: '+1 (555) 123-4567',
//     address: '123 Craft Street, Artisan City, AC 12345',
//     shipping_address: '123 Craft Street, Artisan City, AC 12345',
//     items: [
//       {
//         id: '4',
//         name: 'Personalized Mug',
//         price: 18.99,
//         description: 'Custom ceramic mug with name',
//         image: 'https://images.unsplash.com/photo-1705952297177-619746d21f7c',
//         category: 'gifts',
//         customizable: true,
//         quantity: 3,
//         customizations: {
//           text: 'Best Mom Ever',
//           color: 'Mint Green'
//         }
//       },
//       {
//         id: '5',
//         name: 'Wall Art Decor',
//         price: 38.99,
//         description: 'Handmade wall decoration',
//         image: 'https://images.unsplash.com/photo-1760192159270-591cfd5f11bd',
//         category: 'wall-decor',
//         customizable: false,
//         quantity: 1
//       }
//     ],
//     total: 95.96,
//     status: 'processing',
//     payment_status: 'pending',
//     payment_method: 'cod',
//     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
//   },
//   {
//     id: 'demo004',
//     order_number: 'ORD-DEMO-004',
//     customerName: 'Demo User',
//     customerEmail: 'demo@example.com',
//     customerPhone: '+1 (555) 123-4567',
//     address: '123 Craft Street, Artisan City, AC 12345',
//     shipping_address: '123 Craft Street, Artisan City, AC 12345',
//     items: [
//       {
//         id: '1',
//         name: 'Custom Mandala Art Canvas',
//         price: 45.99,
//         description: 'Beautiful handcrafted mandala art',
//         image: 'https://images.unsplash.com/photo-1761034036989-24640be78e90',
//         category: 'wall-art',
//         customizable: true,
//         quantity: 2,
//         customizations: {
//           color: 'Blue & Silver'
//         }
//       }
//     ],
//     total: 91.98,
//     status: 'pending',
//     payment_status: 'pending',
//     payment_method: 'cod',
//     createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
//   }
// ];

// // Initialize with demo data if needed (for development)
// if (process.env.NODE_ENV === 'development' && useOrderStore.getState().orders.length === 0) {
//   useOrderStore.setState({ orders: demoOrders });
// }
