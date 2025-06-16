
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
        title: 'Смартфон iPhone 15',
        name: 'Смартфон iPhone 15',
        description: 'Новейший смартфон Apple iPhone 15 с камерой 48 МП',
        price: 89990,
        category: 'Электроника',
        imageUrl: '/placeholder.svg',
        image: '/placeholder.svg',
        rating: 4.8,
        inStock: true,
        colors: [],
        sizes: [],
        specifications: [],
        isNew: false,
        isBestseller: false,
        stockQuantity: 50,
        archived: false,
        articleNumber: 'IP15-128GB-BLK',
        sku: 'IP15-128GB-BLK',
        barcode: '',
        countryOfOrigin: '',
        material: '',
        modelName: '',
        wildberriesUrl: '',
        ozonUrl: '',
        avitoUrl: '',
        videoUrl: '',
        videoType: '',
        wildberriesSku: '',
        colorVariants: [],
        additionalImages: [],
        status: 'active',
        stock: 50,
        minStock: 10,
        maxStock: 100,
        supplier: 'Apple Official',
        ozonSynced: true,
        wbSynced: false,
      });

      this.productDb.addProduct({
        title: 'Ноутбук MacBook Air M2',
        name: 'Ноутбук MacBook Air M2',
        description: 'Ноутбук Apple MacBook Air на чипе M2',
        price: 119990,
        category: 'Компьютеры',
        imageUrl: '/placeholder.svg',
        image: '/placeholder.svg',
        rating: 4.8,
        inStock: true,
        colors: [],
        sizes: [],
        specifications: [],
        isNew: false,
        isBestseller: false,
        stockQuantity: 25,
        archived: false,
        articleNumber: 'MBA-M2-256GB',
        sku: 'MBA-M2-256GB',
        barcode: '',
        countryOfOrigin: '',
        material: '',
        modelName: '',
        wildberriesUrl: '',
        ozonUrl: '',
        avitoUrl: '',
        videoUrl: '',
        videoType: '',
        wildberriesSku: '',
        colorVariants: [],
        additionalImages: [],
        status: 'active',
        stock: 25,
        minStock: 5,
        maxStock: 50,
        supplier: 'Apple Official',
        ozonSynced: false,
        wbSynced: true,
      });

      this.productDb.addProduct({
        title: 'Беспроводные наушники AirPods Pro',
        name: 'Беспроводные наушники AirPods Pro',
        description: 'Беспроводные наушники с активным шумоподавлением',
        price: 24990,
        category: 'Аксессуары',
        imageUrl: '/placeholder.svg',
        image: '/placeholder.svg',
        rating: 4.8,
        inStock: true,
        colors: [],
        sizes: [],
        specifications: [],
        isNew: false,
        isBestseller: false,
        stockQuantity: 3,
        archived: false,
        articleNumber: 'APP-2ND-GEN',
        sku: 'APP-2ND-GEN',
        barcode: '',
        countryOfOrigin: '',
        material: '',
        modelName: '',
        wildberriesUrl: '',
        ozonUrl: '',
        avitoUrl: '',
        videoUrl: '',
        videoType: '',
        wildberriesSku: '',
        colorVariants: [],
        additionalImages: [],
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
