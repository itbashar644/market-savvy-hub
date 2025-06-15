
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, ShoppingCart, Eye, Filter } from 'lucide-react';
import { useAnalytics, useProducts, useOrders, useCustomers } from '@/hooks/useDatabase';

const ReportsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { salesData, categoryData, refreshAnalytics } = useAnalytics();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { customers } = useCustomers();

  // Вычисляем общую статистику
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeCustomers = customers.filter(c => c.status === 'active').length;

  // Топ товары по продажам
  const topProducts = products.map(product => {
    const productOrders = orders.filter(order => 
      order.products.some(p => p.productId === product.id)
    );
    const totalSold = productOrders.reduce((sum, order) => {
      const productInOrder = order.products.find(p => p.productId === product.id);
      return sum + (productInOrder?.quantity || 0);
    }, 0);
    const revenue = productOrders.reduce((sum, order) => {
      const productInOrder = order.products.find(p => p.productId === product.id);
      return sum + (productInOrder?.total || 0);
    }, 0);

    return {
      ...product,
      totalSold,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Данные для графика продаж за последние 30 дней
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length,
    };
  });

  // Статус заказов
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: status === 'pending' ? 'В обработке' : 
          status === 'processing' ? 'Обрабатывается' :
          status === 'shipped' ? 'Отправлен' :
          status === 'delivered' ? 'Доставлен' :
          status === 'cancelled' ? 'Отменен' : status,
    value: count,
    color: status === 'delivered' ? '#10b981' :
           status === 'shipped' ? '#3b82f6' :
           status === 'processing' ? '#f59e0b' :
           status === 'pending' ? '#8b5cf6' :
           status === 'cancelled' ? '#ef4444' : '#6b7280'
  }));

  // Категории товаров
  const categoryStats = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { count: 0, totalValue: 0 };
    }
    acc[product.category].count += 1;
    acc[product.category].totalValue += product.price * product.stock;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category,
    products: stats.count,
    value: stats.totalValue,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Расширенная аналитика</h1>
          <p className="text-gray-600 mt-1">Детальный анализ продаж и производительности</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Период
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Общий доход</p>
                <p className="text-2xl font-bold">₽{totalRevenue.toLocaleString()}</p>
                <p className="text-green-100 text-xs mt-1">За все время</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Всего заказов</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-blue-100 text-xs mt-1">Обработано</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Средний чек</p>
                <p className="text-2xl font-bold">₽{Math.round(averageCheck).toLocaleString()}</p>
                <p className="text-purple-100 text-xs mt-1">На заказ</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Активные клиенты</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
                <p className="text-orange-100 text-xs mt-1">Зарегистрировано</p>
              </div>
              <Users className="w-8 h-8 text-orange-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика продаж за 30 дней</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₽${value}`, 'Продажи']} />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Количество заказов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Топ товаров по продажам</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Продано</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.totalSold} шт</TableCell>
                      <TableCell>₽{product.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
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

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Статусы заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Анализ по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₽${value}`, 'Стоимость']} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManager;
