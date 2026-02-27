import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order } from '../types';

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateStatus: (id: string, status: Order['status']) => void;
}

// Demo orders for showcase
const demoOrders: Order[] = [
  {
    id: 'demo001',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    customerPhone: '+1 (555) 123-4567',
    address: '123 Craft Street, Artisan City, AC 12345',
    items: [
      {
        id: '1',
        name: 'Custom Mandala Art Canvas',
        price: 45.99,
        description: 'Beautiful handcrafted mandala art',
        image: 'https://images.unsplash.com/photo-1761034036989-24640be78e90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5kYWxhJTIwYXJ0JTIwY29sb3JmdWx8ZW58MXx8fHwxNzcyMDMzNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'wall-art',
        customizable: true,
        quantity: 1,
        customizations: {
          text: 'Peace & Harmony',
          color: 'Purple & Gold'
        }
      },
      {
        id: '2',
        name: 'Handmade Bookmark Set',
        price: 12.99,
        description: 'Set of 3 artistic bookmarks',
        image: 'https://images.unsplash.com/photo-1760269720423-6d2d6fa492b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMGJvb2ttYXJrJTIwY3JhZnR8ZW58MXx8fHwxNzcyMDMzNzI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'bookmarks',
        customizable: true,
        quantity: 2
      }
    ],
    total: 71.97,
    status: 'delivered',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo002',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    customerPhone: '+1 (555) 123-4567',
    address: '123 Craft Street, Artisan City, AC 12345',
    items: [
      {
        id: '3',
        name: 'Custom Phone Case',
        price: 24.99,
        description: 'Personalized phone case with your design',
        image: 'https://images.unsplash.com/photo-1743670827800-61375c99e7a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBwaG9uZSUyMGNhc2UlMjBkZXNpZ258ZW58MXx8fHwxNzcyMDMzNzI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'phone-cases',
        customizable: true,
        quantity: 1,
        customizations: {
          text: 'Sarah M.',
          color: 'Rose Gold'
        }
      }
    ],
    total: 24.99,
    status: 'shipped',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo003',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    customerPhone: '+1 (555) 123-4567',
    address: '123 Craft Street, Artisan City, AC 12345',
    items: [
      {
        id: '4',
        name: 'Personalized Mug',
        price: 18.99,
        description: 'Custom ceramic mug with name',
        image: 'https://images.unsplash.com/photo-1705952297177-619746d21f7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbGl6ZWQlMjBtdWclMjBnaWZ0fGVufDF8fHx8MTc3MTk5OTUyOHww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'gifts',
        customizable: true,
        quantity: 3,
        customizations: {
          text: 'Best Mom Ever',
          color: 'Mint Green'
        }
      },
      {
        id: '5',
        name: 'Wall Art Decor',
        price: 38.99,
        description: 'Handmade wall decoration',
        image: 'https://images.unsplash.com/photo-1760192159270-591cfd5f11bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWxsJTIwZGVjb3IlMjBoYW5kbWFkZSUyMGFydHxlbnwxfHx8fDE3NzIwMzM3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'wall-decor',
        customizable: false,
        quantity: 1
      }
    ],
    total: 95.96,
    status: 'processing',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo004',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    customerPhone: '+1 (555) 123-4567',
    address: '123 Craft Street, Artisan City, AC 12345',
    items: [
      {
        id: '1',
        name: 'Custom Mandala Art Canvas',
        price: 45.99,
        description: 'Beautiful handcrafted mandala art',
        image: 'https://images.unsplash.com/photo-1761034036989-24640be78e90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5kYWxhJTIwYXJ0JTIwY29sb3JmdWx8ZW58MXx8fHwxNzcyMDMzNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'wall-art',
        customizable: true,
        quantity: 2,
        customizations: {
          color: 'Blue & Silver'
        }
      }
    ],
    total: 91.98,
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: demoOrders,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);