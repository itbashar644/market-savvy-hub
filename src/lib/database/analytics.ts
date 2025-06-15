
import { SalesData, CategoryData, Order, Product, Customer } from '@/types/database';
import { BaseDatabase } from './base';

export class AnalyticsDatabase extends BaseDatabase {
  getSalesData(period: 'week' | 'month' | 'year' = 'month', orders: Order[]): SalesData[] {
    const filteredOrders = orders.filter(o => o.status !== 'cancelled');
    
    const groupedData: { [key: string]: { sales: number; orders: number; customers: Set<string> } } = {};
    
    filteredOrders.forEach(order => {
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

  getCategoryData(products: Product[], orders: Order[]): CategoryData[] {
    const filteredOrders = orders.filter(o => o.status !== 'cancelled');
    
    const categoryStats: { [key: string]: { value: number; sales: number } } = {};
    
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { value: 0, sales: 0 };
      }
      categoryStats[product.category].value += product.stock;
    });
    
    filteredOrders.forEach(order => {
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
}
