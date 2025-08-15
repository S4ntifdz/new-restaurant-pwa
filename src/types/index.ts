export interface Product {
  uuid: string;
  name: string;
  price: number;
  description: string;
  metadata: any;
  stock: number;
  image: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  tenant: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  type: 'product';
}

export interface CartOffer {
  offer: Offer;
  quantity: number;
  type: 'offer';
}

export interface Order {
  id?: number;
  order_number?: number;
  table: string;
  order_products: Array<{
    product: string;
    quantity: number;
    product_details?: Product;
    offer?: string | null;
    offer_details?: any;
  }>;
  order_offers?: Array<{
    offer: string;
    quantity: number;
    offer_details?: Offer;
  }>;
  delivered?: boolean;
  amount?: number;
  created_at?: string;
  status?: string;
  total_amount?: number;
}

export interface OrderProduct {
  product: string;
  quantity: number;
  product_details?: Product;
  offer?: string | null;
  offer_details?: any;
}

export interface Table {
  table_uuid: string;
  number: number;
  calling?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isValidating: boolean;
  error: string | null;
  tableId: string | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'credit_card' | 'transfer' | 'cash';
}

export interface Offer {
  uuid: string;
  name: string;
  price: number;
  products: Array<{
    product: Product;
    quantity: number;
  }>;
}

export interface Menu {
  id: number;
  name: string;
  products: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  category: number;
}

export interface UnpaidOrdersResponse {
  table_uuid: string;
  table_number: number;
  orders: Order[];
  total_amount_owed: number;
  unpaid_orders_count: number;
}