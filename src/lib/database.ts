
import { Customer, Product, Order, InventoryItem, SalesData, CategoryData } from '@/types/database';

// Утилиты для работы с LocalStorage
class LocalDatabase {
  private getStorageKey(table: string): string {
    return `crm_store_${table}`;
  }

  private getFromStorage<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Ошибка при чтении ${table}:`, error);
      return [];
    }
  }

  private saveToStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка при сохранении ${table}:`, error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Работа с клиентами
  getCustomers(): Customer[] {
    return this.getFromStorage<Customer>('customers');
  }

  addCustomer(customer: Omit<Customer, 'id'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId(),
    };
    customers.push(newCustomer);
    this.saveToStorage('customers', customers);
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    customers[index] = { ...customers[index], ...updates };
    this.saveToStorage('customers', customers);
    return customers[index];
  }

  deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    
    this.saveToStorage('customers', filtered);
    return true;
  }

  // Работа с товарами
  getProducts(): Product[] {
    return this.getFromStorage<Product>('products');
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
    products.push(newProduct);
    this.saveToStorage('products', products);
    this.updateInventoryFromProduct(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { 
      ...products[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveToStorage('products', products);
    this.updateInventoryFromProduct(products[index]);
    return products[index];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    
    this.saveToStorage('products', filtered);
    this.deleteInventoryItem(id);
    return true;
  }

  // Работа с заказами
  getOrders(): Order[] {
    return this.getFromStorage<Order>('orders');
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
    orders.push(newOrder);
    this.saveToStorage('orders', orders);
    this.updateCustomerStats(order.customerId);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    orders[index] = { 
      ...orders[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveToStorage('orders', orders);
    return orders[index];
  }

  deleteOrder(id: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return false;
    
    this.saveToStorage('orders', filtered);
    return true;
  }

  // Работа с остатками
  getInventory(): InventoryItem[] {
    return this.getFromStorage<InventoryItem>('inventory');
  }

  updateInventoryStock(productId: string, newStock: number): InventoryItem | null {
    const inventory = this.getInventory();
    const index = inventory.findIndex(i => i.productId === productId);
    if (index === -1) return null;

    const item = inventory[index];
    item.currentStock = newStock;
    item.status = newStock <= 0 ? 'out_of_stock' 
                : newStock <= item.minStock ? 'low_stock' 
                : 'in_stock';
    item.lastRestocked = new Date().toISOString();
    
    this.saveToStorage('inventory', inventory);
    return item;
  }

  private updateInventoryFromProduct(product: Product): void {
    const inventory = this.getInventory();
    const index = inventory.findIndex(i => i.productId === product.id);
    
    const inventoryItem: InventoryItem = {
      id: index >= 0 ? inventory[index].id : this.generateId(),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      price: product.price,
      supplier: product.supplier,
      lastRestocked: new Date().toISOString(),
      status: product.status as any,
    };

    if (index >= 0) {
      inventory[index] = inventoryItem;
    } else {
      inventory.push(inventoryItem);
    }
    
    this.saveToStorage('inventory', inventory);
  }

  private deleteInventoryItem(productId: string): void {
    const inventory = this.getInventory();
    const filtered = inventory.filter(i => i.productId !== productId);
    this.saveToStorage('inventory', filtered);
  }

  private updateCustomerStats(customerId: string): void {
    const orders = this.getOrders().filter(o => o.customerId === customerId);
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = orders.length > 0 
      ? Math.max(...orders.map(o => new Date(o.createdAt).getTime()))
      : 0;

    this.updateCustomer(customerId, {
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrderDate > 0 ? new Date(lastOrderDate).toISOString().split('T')[0] : '',
    });
  }

  // Аналитика и отчеты
  getSalesData(period: 'week' | 'month' | 'year' = 'month'): SalesData[] {
    const orders = this.getOrders().filter(o => o.status !== 'cancelled');
    const customers = this.getCustomers();
    
    // Группировка по периодам
    const groupedData: { [key: string]: { sales: number; orders: number; customers: Set<string> } } = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = String(date.getFullYear());
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { sales: 0, orders: 0, customers: new Set() };
      }
      
      groupedData[key].sales += order.total;
      groupedData[key].orders += 1;
      groupedData[key].customers.add(order.customerId);
    });
    
    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders,
      customers: data.customers.size,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  getCategoryData(): CategoryData[] {
    const products = this.getProducts();
    const orders = this.getOrders().filter(o => o.status !== 'cancelled');
    
    const categoryStats: { [key: string]: { value: number; sales: number } } = {};
    
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { value: 0, sales: 0 };
      }
      categoryStats[product.category].value += product.stock;
    });
    
    orders.forEach(order => {
      order.products.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          categoryStats[product.category].sales += item.total;
        }
      });
    });
    
    return Object.entries(categoryStats).map(([name, data]) => ({
      name,
      value: data.value,
      sales: data.sales,
    }));
  }

  // Инициализация тестовых данных
  seedDatabase(): void {
    if (this.getCustomers().length === 0) {
      this.addCustomer({
        name: 'Иван Петров',
        email: 'ivan@example.com',
        phone: '+7 900 123-45-67',
        totalOrders: 0,
        totalSpent: 0,
        status: 'active',
        registrationDate: '2024-01-15',
        lastOrderDate: '',
        address: 'ул. Ленина, 10',
        city: 'Москва',
        country: 'Россия',
      });

      this.addCustomer({
        name: 'Мария Сидорова',
        email: 'maria@example.com',
        phone: '+7 900 987-65-43',
        totalOrders: 0,
        totalSpent: 0,
        status: 'active',
        registrationDate: '2024-02-20',
        lastOrderDate: '',
        address: 'пр. Мира, 25',
        city: 'Санкт-Петербург',
        country: 'Россия',
      });
    }

    if (this.getProducts().length === 0) {
      this.addProduct({
        name: 'Смартфон iPhone 15',
        sku: 'IP15-128GB-BLK',
        category: 'Электроника',
        price: 89990,
        description: 'Новейший смартфон Apple iPhone 15 с камерой 48 МП',
        image: '/placeholder.svg',
        status: 'active',
        stock: 50,
        minStock: 10,
        maxStock: 100,
        supplier: 'Apple Official',
        ozonSynced: true,
        wbSynced: false,
      });

      this.addProduct({
        name: 'Ноутбук MacBook Air M2',
        sku: 'MBA-M2-256GB',
        category: 'Компьютеры',
        price: 119990,
        description: 'Ноутбук Apple MacBook Air на чипе M2',
        image: '/placeholder.svg',
        status: 'active',
        stock: 25,
        minStock: 5,
        maxStock: 50,
        supplier: 'Apple Official',
        ozonSynced: false,
        wbSynced: true,
      });

      this.addProduct({
        name: 'Беспроводные наушники AirPods Pro',
        sku: 'APP-2ND-GEN',
        category: 'Аксессуары',
        price: 24990,
        description: 'Беспроводные наушники с активным шумоподавлением',
        image: '/placeholder.svg',
        status: 'low_stock',
        stock: 3,
        minStock: 5,
        maxStock: 30,
        supplier: 'Apple Official',
        ozonSynced: true,
        wbSynced: true,
      });
    }
  }
}

export const db = new LocalDatabase();
