
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, BadgeRussianRuble } from 'lucide-react';

const Dashboard = () => {
  const salesData = [
    { name: 'Пн', sales: 0, orders: 0 },
    { name: 'Вт', sales: 0, orders: 0 },
    { name: 'Ср', sales: 0, orders: 0 },
    { name: 'Чт', sales: 0, orders: 0 },
    { name: 'Пт', sales: 0, orders: 0 },
    { name: 'Сб', sales: 0, orders: 0 },
    { name: 'Вс', sales: 0, orders: 0 },
  ];

  const marketplaceData = [
    { name: 'Ozon', value: 0, color: '#0ea5e9' },
    { name: 'Wildberries', value: 0, color: '#8b5cf6' },
    { name: 'Яндекс.Маркет', value: 0, color: '#f59e0b' },
  ];

  const stats = [
    {
      title: 'Общий доход',
      value: '0 ₽',
      change: '0%',
      trend: 'up',
      icon: BadgeRussianRuble,
      color: 'text-green-600'
    },
    {
      title: 'Заказы',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Товары',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: Package,
      color: 'text-purple-600'
    },
    {
      title: 'Клиенты',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600 mt-1">Обзор показателей вашего магазина</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg">
          Сегодня: {new Date().toLocaleDateString('ru-RU')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {stat.change} за неделю
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Продажи за неделю</CardTitle>
            <CardDescription>Динамика продаж и количества заказов</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" name="Продажи (₽)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketplace Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Распределение по маркетплейсам</CardTitle>
            <CardDescription>Доля продаж по платформам</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketplaceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {marketplaceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Тренд заказов</CardTitle>
          <CardDescription>Количество заказов за последние 7 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Заказы"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
