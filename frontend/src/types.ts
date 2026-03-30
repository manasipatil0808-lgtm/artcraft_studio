export type UserRole = 'customer' | 'seller' | 'admin';

export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
  image_url?: string;
  category: string;
  customizable: boolean;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  customizations?: {
    text?: string;
    color?: string;
    image?: string; // URL or base64
  };
}

export interface Order {
  id: string | number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}
