
import { Customer, Product, Order, InventoryItem, InventoryHistory, SalesData, CategoryData, OrderStatusHistory } from '@/types/database';

// Этот файл теперь содержит только интерфейс совместимости
// Все данные теперь хранятся в Supabase через соответствующие хуки

console.warn('⚠️ LocalDatabase устарел. Используйте хуки из @/hooks/useDatabase');

class DeprecatedLocalDatabase {
  // Customer methods - устарели, используйте useCustomers hook
  getCustomers(): Customer[] {
    console.warn('getCustomers устарел. Используйте useCustomers hook');
    return [];
  }

  addCustomer(customer: Omit<Customer, 'id'>): Customer {
    console.warn('addCustomer устарел. Используйте useCustomers hook');
    return { ...customer, id: '' };
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    console.warn('updateCustomer устарел. Используйте useCustomers hook');
    return null;
  }

  deleteCustomer(id: string): boolean {
    console.warn('deleteCustomer устарел. Используйте useCustomers hook');
    return false;
  }

  // Product methods - устарели, используйте useProducts hook
  getProducts(): Product[] {
    console.warn('getProducts устарел. Используйте useProducts hook');
    return [];
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    console.warn('addProduct устарел. Используйте useProducts hook');
    return { ...product, id: '', createdAt: '', updatedAt: '' };
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    console.warn('updateProduct устарел. Используйте useProducts hook');
    return null;
  }

  deleteProduct(id: string): boolean {
    console.warn('deleteProduct устарел. Используйте useProducts hook');
    return false;
  }

  // Order methods - устарели, используйте useOrders hook
  getOrders(): Order[] {
    console.warn('getOrders устарел. Используйте useOrders hook');
    return [];
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    console.warn('addOrder устарел. Используйте useOrders hook');
    return { ...order, id: '', createdAt: '', updatedAt: '' };
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    console.warn('updateOrder устарел. Используйте useOrders hook');
    return null;
  }

  deleteOrder(id: string): boolean {
    console.warn('deleteOrder устарел. Используйте useOrders hook');
    return false;
  }

  getOrderWithHistory(orderId: string): Order | null {
    console.warn('getOrderWithHistory устарел. Используйте useOrders hook');
    return null;
  }

  getOrderStatusHistory(): OrderStatusHistory[] {
    console.warn('getOrderStatusHistory устарел. Используйте useOrderStatusHistory hook');
    return [];
  }

  // Inventory methods - устарели, используйте useInventory hook
  getInventory(): InventoryItem[] {
    console.warn('getInventory устарел. Используйте useInventory hook');
    return [];
  }

  updateInventoryStock(productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string): InventoryItem | null {
    console.warn('updateInventoryStock устарел. Используйте useInventory hook');
    return null;
  }

  bulkUpdateInventoryStock(updates: { sku: string; newStock: number }[]): void {
    console.warn('bulkUpdateInventoryStock устарел. Используйте useInventory hook');
  }

  getInventoryHistory(): InventoryHistory[] {
    console.warn('getInventoryHistory устарел. Используйте useInventoryHistory hook');
    return [];
  }

  addInventoryHistory(historyRecord: Omit<InventoryHistory, 'id'>): InventoryHistory {
    console.warn('addInventoryHistory устарел. Используйте useInventoryHistory hook');
    return { ...historyRecord, id: '' };
  }

  // Analytics methods - устарели, используйте useAnalytics hook
  getSalesData(period: 'week' | 'month' | 'year' = 'month'): SalesData[] {
    console.warn('getSalesData устарел. Используйте useAnalytics hook');
    return [];
  }

  getCategoryData(): CategoryData[] {
    console.warn('getCategoryData устарел. Используйте useAnalytics hook');
    return [];
  }

  // Seed method - устарел
  seedDatabase(): void {
    console.warn('seedDatabase устарел. Данные уже в Supabase');
  }
}

export const db = new DeprecatedLocalDatabase();
