import { Order, OrderStatusHistory } from '@/types/database';
import { BaseDatabase } from './base';

export class OrderDatabase extends BaseDatabase {
  getOrders(): Order[] {
    return this.getFromStorage<Order>('orders');
  }

  getOrderStatusHistory(): OrderStatusHistory[] {
    return this.getFromStorage<OrderStatusHistory>('orderStatusHistory');
  }

  addOrderStatusHistory(historyRecord: Omit<OrderStatusHistory, 'id'>): OrderStatusHistory {
    const history = this.getOrderStatusHistory();
    const newHistoryRecord: OrderStatusHistory = {
      ...historyRecord,
      id: this.generateId(),
    };
    history.push(newHistoryRecord);
    this.saveToStorage('orderStatusHistory', history);
    return newHistoryRecord;
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      source: order.source || 'CRM',
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
    orders.push(newOrder);
    this.saveToStorage('orders', orders);

    // Добавляем запись в историю статусов при создании заказа
    this.addOrderStatusHistory({
      orderId: newOrder.id,
      toStatus: order.status,
      changedAt: now,
      notes: 'Заказ создан'
    });

    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    const currentOrder = orders[index];
    const now = new Date().toISOString();
    
    // Если статус изменился, добавляем запись в историю
    if (updates.status && updates.status !== currentOrder.status) {
      this.addOrderStatusHistory({
        orderId: id,
        fromStatus: currentOrder.status,
        toStatus: updates.status,
        changedAt: now,
        notes: `Статус изменен с "${this.getStatusText(currentOrder.status)}" на "${this.getStatusText(updates.status)}"`
      });
    }
    
    orders[index] = { 
      ...orders[index], 
      ...updates, 
      updatedAt: now
    };
    this.saveToStorage('orders', orders);
    return orders[index];
  }

  deleteOrder(id: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return false;
    
    this.saveToStorage('orders', filtered);
    
    // Удаляем историю статусов для этого заказа
    const history = this.getOrderStatusHistory();
    const filteredHistory = history.filter(h => h.orderId !== id);
    this.saveToStorage('orderStatusHistory', filteredHistory);
    
    return true;
  }

  getOrderWithHistory(orderId: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const history = this.getOrderStatusHistory();
    const orderHistory = history.filter(h => h.orderId === orderId);
    
    return {
      ...order,
      statusHistory: orderHistory
    };
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'processing': return 'Обработка';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  }
}
