
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users } from 'lucide-react';

interface KPICardsProps {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueGrowth: number;
}

const KPICards = ({ 
  totalRevenue, 
  totalOrders, 
  averageOrderValue, 
  totalCustomers, 
  revenueGrowth 
}: KPICardsProps) => {
  return (
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
  );
};

export default KPICards;
