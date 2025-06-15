
import { CustomerDatabase } from './customers';
import { ProductDatabase } from './products';
import { InventoryDatabase } from './inventory';

export class SeedDatabase {
  constructor(
    private customerDb: CustomerDatabase,
    private productDb: ProductDatabase,
    private inventoryDb: InventoryDatabase
  ) {}

  seedDatabase(): void {
    if (this.customerDb.getCustomers().length === 0) {
      this.customerDb.addCustomer({
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

      this.customerDb.addCustomer({
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

    if (this.productDb.getProducts().length === 0) {
      this.productDb.addProduct({
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

      this.productDb.addProduct({
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

      this.productDb.addProduct({
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

      // Добавляем тестовую историю изменений
      this.inventoryDb.addInventoryHistory({
        productId: 'test-product-1',
        productName: 'Смартфон iPhone 15',
        sku: 'IP15-128GB-BLK',
        previousStock: 60,
        newStock: 50,
        changeAmount: -10,
        changeType: 'sale',
        reason: 'Продажа через интернет-магазин',
        userName: 'Система',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      });

      this.inventoryDb.addInventoryHistory({
        productId: 'test-product-2',
        productName: 'Ноутбук MacBook Air M2',
        sku: 'MBA-M2-256GB',
        previousStock: 20,
        newStock: 25,
        changeAmount: 5,
        changeType: 'restock',
        reason: 'Поступление от поставщика',
        userName: 'Администратор',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
      });
    }
  }
}
