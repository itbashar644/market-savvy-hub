
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users } from 'lucide-react';

const ReportsManager = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const salesData: any[] = [];
  const categoryData: any[] = [];
  const topProducts: any[] = [];
  const reports: any[] = [];

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
                <p className="text-2xl font-bold text-gray-900">₽0</p>
                <p className="text-sm text-gray-500">Нет данных</p>
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
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Нет данных</p>
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
                <p className="text-2xl font-bold text-gray-900">₽0</p>
                <p className="text-sm text-gray-500">Нет данных</p>
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
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Нет данных</p>
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
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Нет данных для отображения
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Продажи по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Нет данных для отображения
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Топ товаров по продажам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет данных о продажах товаров</p>
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
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Нет готовых отчетов</h3>
                <p>Создайте первый отчет, чтобы начать анализ данных</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Создать отчет
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManager;
