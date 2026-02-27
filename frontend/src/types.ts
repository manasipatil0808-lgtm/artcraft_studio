export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  customizable: boolean;
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
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
