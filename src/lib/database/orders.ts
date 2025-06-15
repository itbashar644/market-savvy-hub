
import { Order } from '@/types/database';
import { BaseDatabase } from './base';

export class OrderDatabase extends BaseDatabase {
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
}
