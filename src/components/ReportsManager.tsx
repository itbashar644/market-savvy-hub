
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users } from 'lucide-react';

const ReportsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const salesData = [
    { month: 'Янв', sales: 450000, orders: 45 },
    { month: 'Фев', sales: 520000, orders: 52 },
    { month: 'Мар', sales: 380000, orders: 38 },
    { month: 'Апр', sales: 620000, orders: 62 },
    { month: 'Май', sales: 750000, orders: 75 },
    { month: 'Июн', sales: 680000, orders: 68 }
  ];

  const categoryData = [
    { name: 'Смартфоны', value: 45, color: '#3B82F6' },
    { name: 'Ноутбуки', value: 25, color: '#10B981' },
    { name: 'Планшеты', value: 20, color: '#F59E0B' },
    { name: 'Аксессуары', value: 10, color: '#EF4444' }
  ];

  const topProducts = [
    { name: 'iPhone 14', sold: 156, revenue: 10920000 },
    { name: 'MacBook Pro', sold: 89, revenue: 13350000 },
    { name: 'iPad Air', sold: 124, revenue: 6820000 },
    { name: 'AirPods Pro', sold: 203, revenue: 5075000 }
  ];

  const reports = [
    {
      id: '1',
      name: 'Отчет по продажам за июнь',
      type: 'Продажи',
      period: 'Июнь 2024',
      status: 'ready',
      createdAt: '2024-07-01',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Анализ клиентской базы',
      type: 'Клиенты',
      period: 'Q2 2024',
      status: 'ready',
      createdAt: '2024-06-30',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Складские остатки',
      type: 'Инвентарь',
      period: 'На 01.07.24',
      status: 'processing',
      createdAt: '2024-07-01',
      size: '-'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Отчеты и аналитика</h1>
          <p className="text-gray-600 mt-1">Анализируйте продажи и производительность</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Выбрать период
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Создать отчет
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Продажи за месяц</p>
                <p className="text-2xl font-bold text-gray-900">₽680,000</p>
                <p className="text-sm text-green-600">+12% к прошлому месяцу</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Заказов за месяц</p>
                <p className="text-2xl font-bold text-gray-900">68</p>
                <p className="text-sm text-green-600">+8% к прошлому месяцу</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средний чек</p>
                <p className="text-2xl font-bold text-gray-900">₽10,000</p>
                <p className="text-sm text-green-600">+5% к прошлому месяцу</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Новые клиенты</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-red-600">-3% к прошлому месяцу</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="reports">Готовые отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Динамика продаж</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₽${value.toLocaleString()}`, 'Продажи']} />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Продажи по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Топ товаров по продажам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Продано: {product.sold} шт.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₽{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">выручка</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Готовые отчеты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{report.type}</Badge>
                          <span className="text-sm text-gray-500">{report.period}</span>
                        </div>
                        <p className="text-sm text-gray-500">Создан: {report.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={report.status === 'ready' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                        }>
                          {report.status === 'ready' ? 'Готов' : 'Обработка'}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">{report.size}</p>
                      </div>
                      {report.status === 'ready' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManager;
