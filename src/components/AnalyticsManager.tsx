
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Calendar, Filter, Download } from 'lucide-react';
import { useAnalytics, useProducts, useOrders, useCustomers } from '@/hooks/useDatabase';

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
    
    return { ...product, revenue };
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Аналитика продаж</h1>
          <p className="text-gray-600 mt-1">Детальная аналитика эффективности бизнеса</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="year">За год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Основные KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Общая выручка</p>
                <p className="text-3xl font-bold">₽{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
                  <span className="text-green-200 text-sm">+{revenueGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Всего заказов</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
                  <span className="text-blue-200 text-sm">+12.5%</span>
                </div>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Средний чек</p>
                <p className="text-3xl font-bold">₽{Math.round(averageOrderValue).toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-purple-200 mr-1" />
                  <span className="text-purple-200 text-sm">-2.1%</span>
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Активные клиенты</p>
                <p className="text-3xl font-bold">{totalCustomers}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-200 mr-1" />
                  <span className="text-orange-200 text-sm">+8.3%</span>
                </div>
              </div>
              <Users className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
          <TabsTrigger value="conversion">Конверсия</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Продажи по дням недели</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₽${value}`, 'Выручка']} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Средний чек по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={avgCheckByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₽${value}`, 'Средний чек']} />
                    <Area 
                      type="monotone" 
                      dataKey="avgCheck" 
                      stroke="#8b5cf6" 
                      fill="#c4b5fd" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Динамика продаж</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Топ товаров по выручке</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsByRevenue.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded object-cover" 
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₽{product.price.toLocaleString()}</TableCell>
                      <TableCell>₽{product.revenue.toLocaleString()}</TableCell>
                      <TableCell>{product.stock} шт</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {product.status === 'active' ? 'Активен' :
                           product.status === 'low_stock' ? 'Мало' :
                           'Нет в наличии'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-3xl font-bold text-blue-600">{customerAnalysis.new}</p>
                <p className="text-gray-600">Новые клиенты</p>
                <p className="text-sm text-green-600 mt-2">За последний месяц</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-3xl font-bold text-green-600">{customerAnalysis.returning}</p>
                <p className="text-gray-600">Возвращающиеся</p>
                <p className="text-sm text-blue-600 mt-2">Более 1 заказа</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <p className="text-3xl font-bold text-purple-600">{customerAnalysis.vip}</p>
                <p className="text-gray-600">VIP клиенты</p>
                <p className="text-sm text-purple-600 mt-2">Покупки &gt; 50к ₽</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Воронка конверсии</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Продажи по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    dataKey="sales"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₽${value}`, 'Продажи']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsManager;
