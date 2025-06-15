
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface CustomerAnalysisData {
  new: number;
  returning: number;
  vip: number;
}

interface CustomerAnalyticsProps {
  customerAnalysis: CustomerAnalysisData;
}

const CustomerAnalytics = ({ customerAnalysis }: CustomerAnalyticsProps) => {
  return (
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
  );
};

export default CustomerAnalytics;
