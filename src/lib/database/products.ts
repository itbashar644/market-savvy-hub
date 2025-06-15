
import { Product } from '@/types/database';
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
    
    products[index] = { 
      ...products[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveToStorage('products', products);
    return products[index];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    
    this.saveToStorage('products', filtered);
    return true;
  }
}
