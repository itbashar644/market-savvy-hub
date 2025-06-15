
// Интерфейсы для базы данных

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registrationDate: string;
  lastOrderDate: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  image: string;
  status: 'active' | 'low_stock' | 'out_of_stock';
  stock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
  ozonSynced: boolean;
  wbSynced: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface InventoryHistory {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: 'manual' | 'sale' | 'restock' | 'adjustment' | 'return';
  reason?: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

export interface CategoryData {
  name: string;
  value: number;
  sales: number;
}
