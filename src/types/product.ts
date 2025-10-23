export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'classicas' | 'especiais' | 'doces';
}

export interface CartItem extends Product {
  quantity: number;
  size: 'P' | 'M' | 'G' | 'GG';
  observations?: string;
  extras?: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'received' | 'preparing' | 'delivery' | 'delivered';
  createdAt: Date;
  deliveryAddress?: string;
  paymentMethod?: string;
}
