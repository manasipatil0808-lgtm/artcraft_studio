import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, customizations?: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product, quantity, customizations) => set((state) => {
        const newItem = { ...product, quantity, customizations };
        const updatedItems = [...state.items, newItem];
        return { 
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        };
      }),
      removeItem: (id) => set((state) => {
        const updatedItems = state.items.filter(item => item.id !== id);
        return {
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        };
      }),
      updateQuantity: (id, quantity) => set((state) => {
        const updatedItems = state.items.map(item => item.id === id ? { ...item, quantity } : item);
        return {
          items: updatedItems,
          total: updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        };
      }),
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
