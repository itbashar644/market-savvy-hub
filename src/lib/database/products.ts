
import { Product, InventoryItem } from '@/types/database';
import { BaseDatabase } from './base';

export class ProductDatabase extends BaseDatabase {
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
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedProduct = { 
      ...products[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    products[index] = updatedProduct;
    this.saveToStorage('products', products);

    // Sync with inventory
    const inventory = this.getFromStorage<InventoryItem>('inventory');
    const invIndex = inventory.findIndex(i => i.productId === updatedProduct.id);

    let inventoryStatus: InventoryItem['status'];
    switch (updatedProduct.status) {
      case 'active':
        inventoryStatus = 'in_stock';
        break;
      case 'low_stock':
        inventoryStatus = 'low_stock';
        break;
      case 'out_of_stock':
        inventoryStatus = 'out_of_stock';
        break;
      default:
        inventoryStatus = updatedProduct.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    const inventoryItem: InventoryItem = {
      id: invIndex >= 0 ? inventory[invIndex].id : this.generateId(),
      productId: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      category: updatedProduct.category,
      currentStock: updatedProduct.stock,
      minStock: updatedProduct.minStock,
      maxStock: updatedProduct.maxStock,
      price: updatedProduct.price,
      supplier: updatedProduct.supplier,
      lastRestocked: invIndex >= 0 ? inventory[invIndex].lastRestocked : new Date().toISOString(),
      status: inventoryStatus,
      wildberries_sku: updatedProduct.wildberriesSku, // Используем правильное поле
    };

    if (invIndex >= 0) {
      inventory[invIndex] = inventoryItem;
    } else {
      inventory.push(inventoryItem);
    }
    this.saveToStorage('inventory', inventory);
    
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    
    this.saveToStorage('products', filtered);
    return true;
  }

  // Новый метод для массового обновления SKU Wildberries
  updateWildberriesSkus(skuMappings: { [internalSku: string]: string }): boolean {
    const products = this.getProducts();
    let updated = false;

    products.forEach(product => {
      if (skuMappings[product.sku]) {
        product.wildberriesSku = skuMappings[product.sku]; // Используем правильное поле
        product.updatedAt = new Date().toISOString();
        updated = true;
      }
    });

    if (updated) {
      this.saveToStorage('products', products);
    }

    return updated;
  }
}
