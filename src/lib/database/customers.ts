
import { Customer } from '@/types/database';
import { BaseDatabase } from './base';

export class CustomerDatabase extends BaseDatabase {
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

  updateCustomerStats(customerId: string, orders: any[]): void {
    const customerOrders = orders.filter(o => o.customerId === customerId);
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = customerOrders.length > 0 
      ? Math.max(...customerOrders.map(o => new Date(o.createdAt).getTime()))
      : 0;

    this.updateCustomer(customerId, {
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrderDate > 0 ? new Date(lastOrderDate).toISOString().split('T')[0] : '',
    });
  }
}
