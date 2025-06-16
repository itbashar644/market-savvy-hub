
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
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrl: string;
  additionalImages?: any[];
  rating: number;
  inStock: boolean;
  colors?: any[];
  sizes?: any[];
  specifications?: any[];
  isNew?: boolean;
  isBestseller?: boolean;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  articleNumber?: string;
  barcode?: string;
  countryOfOrigin?: string;
  material?: string;
  modelName?: string;
  wildberriesUrl?: string;
  ozonUrl?: string;
  avitoUrl?: string;
  videoUrl?: string;
  videoType?: string;
  wildberriesSku?: string;
  colorVariants?: any[];
  // Для обратной совместимости с компонентами
  name?: string;
  sku?: string;
  image?: string;
  status?: 'active' | 'low_stock' | 'out_of_stock';
  stock?: number;
  minStock?: number;
  maxStock?: number;
  supplier?: string;
  ozonSynced?: boolean;
  wbSynced?: boolean;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  toStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  changedAt: string;
  changedBy?: string;
  notes?: string;
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
  statusHistory?: OrderStatusHistory[];
  source?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Profile {
  id: string;
  status: 'pending' | 'approved';
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
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
  wildberries_sku?: string;
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
