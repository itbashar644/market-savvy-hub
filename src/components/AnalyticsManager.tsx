
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics, useProducts, useOrders, useCustomers } from '@/hooks/useDatabase';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import KPICards from './analytics/KPICards';
import SalesAnalytics from './analytics/SalesAnalytics';
import ProductAnalytics from './analytics/ProductAnalytics';
import CustomerAnalytics from './analytics/CustomerAnalytics';
import ConversionAnalytics from './analytics/ConversionAnalytics';
import TrendsAnalytics from './analytics/TrendsAnalytics';

const AnalyticsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { salesData, categoryData, refreshAnalytics } = useAnalytics();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { customers } = useCustomers();

  // Расчет основных метрик
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Анализ роста по сравнению с предыдущим периодом
  const currentMonth = new Date().getMonth();
  const currentMonthOrders = orders.filter(order => 
    new Date(order.createdAt).getMonth() === currentMonth
  );
  const previousMonthOrders = orders.filter(order => 
    new Date(order.createdAt).getMonth() === currentMonth - 1
  );

  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  // Данные для графика конверсии
  const conversionData = [
    { name: 'Просмотры', value: 10000, color: '#3b82f6' },
    { name: 'В корзину', value: 2500, color: '#8b5cf6' },
    { name: 'Оформлено', value: totalOrders, color: '#10b981' },
  ];

  // Топ товары по выручке
  const topProductsByRevenue = products.map(product => {
    const productOrders = orders.filter(order => 
      order.products.some(p => p.productId === product.id)
    );
    const revenue = productOrders.reduce((sum, order) => {
      const productInOrder = order.products.find(p => p.productId === product.id);
      return sum + (productInOrder?.total || 0);
    }, 0);
    
    return { 
      ...product, 
      name: product.name || product.title, // Ensure name is always set
      sku: product.sku || product.articleNumber || product.id, // Ensure sku is always set
      image: product.image || product.imageUrl, // Ensure image is always set
      stock: product.stock || product.stockQuantity || 0, // Ensure stock is always set
      status: product.status || (product.stockQuantity && product.stockQuantity > 0 ? 'active' : 'out_of_stock'), // Ensure status is always set
      revenue 
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Анализ клиентов
  const customerAnalysis = {
    new: customers.filter(c => {
      const regDate = new Date(c.registrationDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return regDate > monthAgo;
    }).length,
    returning: customers.filter(c => c.totalOrders > 1).length,
    vip: customers.filter(c => c.totalSpent > 50000).length,
  };

  // Данные продаж по дням недели
  const salesByDayOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
    const dayOrders = orders.filter(order => {
      const orderDay = new Date(order.createdAt).getDay();
      return orderDay === (index + 1) % 7;
    });
    return {
      day,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
    };
  });

  // Анализ среднего чека по категориям
  const avgCheckByCategory = categoryData.map(cat => ({
    ...cat,
    avgCheck: cat.sales > 0 ? cat.sales / (orders.filter(order => 
      order.products.some(p => {
        const product = products.find(prod => prod.id === p.productId);
        return product?.category === cat.name;
      })
    ).length || 1) : 0
  }));

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      <KPICards
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        averageOrderValue={averageOrderValue}
        totalCustomers={totalCustomers}
        revenueGrowth={revenueGrowth}
      />

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
          <TabsTrigger value="conversion">Конверсия</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesAnalytics
            salesData={salesData}
            salesByDayOfWeek={salesByDayOfWeek}
            avgCheckByCategory={avgCheckByCategory}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductAnalytics topProductsByRevenue={topProductsByRevenue} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerAnalytics customerAnalysis={customerAnalysis} />
        </TabsContent>

        <TabsContent value="conversion">
          <ConversionAnalytics conversionData={conversionData} />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsAnalytics categoryData={categoryData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsManager;
