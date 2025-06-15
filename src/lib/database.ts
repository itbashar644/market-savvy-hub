import { Customer, Product, Order, InventoryItem, InventoryHistory, SalesData, CategoryData, OrderStatusHistory } from '@/types/database';
import { CustomerDatabase } from './database/customers';
import { ProductDatabase } from './database/products';
import { OrderDatabase } from './database/orders';
import { InventoryDatabase } from './database/inventory';
import { AnalyticsDatabase } from './database/analytics';
import { SeedDatabase } from './database/seed';

class LocalDatabase {
  private customerDb: CustomerDatabase;
  private productDb: ProductDatabase;
  private orderDb: OrderDatabase;
  private inventoryDb: InventoryDatabase;
  private analyticsDb: AnalyticsDatabase;
  private seedDb: SeedDatabase;

  constructor() {
    this.customerDb = new CustomerDatabase();
    this.productDb = new ProductDatabase();
    this.orderDb = new OrderDatabase();
    this.inventoryDb = new InventoryDatabase();
    this.analyticsDb = new AnalyticsDatabase();
    this.seedDb = new SeedDatabase(this.customerDb, this.productDb, this.inventoryDb);
  }

  // Customer methods
  getCustomers(): Customer[] {
    return this.customerDb.getCustomers();
  }

  addCustomer(customer: Omit<Customer, 'id'>): Customer {
    return this.customerDb.addCustomer(customer);
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    return this.customerDb.updateCustomer(id, updates);
  }

  deleteCustomer(id: string): boolean {
    return this.customerDb.deleteCustomer(id);
  }

  // Product methods
  getProducts(): Product[] {
    return this.productDb.getProducts();
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct = this.productDb.addProduct(product);
    this.inventoryDb.updateInventoryFromProduct(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const updatedProduct = this.productDb.updateProduct(id, updates);
    if (updatedProduct) {
      this.inventoryDb.updateInventoryFromProduct(updatedProduct);
    }
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    const success = this.productDb.deleteProduct(id);
    if (success) {
      this.inventoryDb.deleteInventoryItem(id);
    }
    return success;
  }

  // Order methods with status history
  getOrders(): Order[] {
    return this.orderDb.getOrders();
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder = this.orderDb.addOrder(order);
    this.customerDb.updateCustomerStats(order.customerId, this.orderDb.getOrders());
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const updatedOrder = this.orderDb.updateOrder(id, updates);
    if (updatedOrder) {
      this.customerDb.updateCustomerStats(updatedOrder.customerId, this.orderDb.getOrders());
    }
    return updatedOrder;
  }

  deleteOrder(id: string): boolean {
    return this.orderDb.deleteOrder(id);
  }

  getOrderWithHistory(orderId: string): Order | null {
    return this.orderDb.getOrderWithHistory(orderId);
  }

  getOrderStatusHistory(): OrderStatusHistory[] {
    return this.orderDb.getOrderStatusHistory();
  }

  // Inventory methods
  getInventory(): InventoryItem[] {
    return this.inventoryDb.getInventory();
  }

  updateInventoryStock(productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string): InventoryItem | null {
    return this.inventoryDb.updateInventoryStock(productId, newStock, changeType, reason);
  }

  getInventoryHistory(): InventoryHistory[] {
    return this.inventoryDb.getInventoryHistory();
  }

  addInventoryHistory(historyRecord: Omit<InventoryHistory, 'id'>): InventoryHistory {
    return this.inventoryDb.addInventoryHistory(historyRecord);
  }

  // Analytics methods
  getSalesData(period: 'week' | 'month' | 'year' = 'month'): SalesData[] {
    return this.analyticsDb.getSalesData(period, this.orderDb.getOrders());
  }

  getCategoryData(): CategoryData[] {
    return this.analyticsDb.getCategoryData(this.productDb.getProducts(), this.orderDb.getOrders());
  }

  // Seed method
  seedDatabase(): void {
    this.seedDb.seedDatabase();
  }
}

export const db = new LocalDatabase();
