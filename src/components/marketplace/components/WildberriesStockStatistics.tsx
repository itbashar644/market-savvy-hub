
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface WildberriesStockStatisticsProps {
  totalWbItems: number;
  itemsWithStock: number;
}

export const WildberriesStockStatistics: React.FC<WildberriesStockStatisticsProps> = ({
  totalWbItems,
  itemsWithStock
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Статистика остатков Wildberries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800">Всего SKU WB</div>
            <div className="text-2xl font-bold text-blue-600">{totalWbItems}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-800">С остатком &gt; 0</div>
            <div className="text-2xl font-bold text-green-600">{itemsWithStock}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="font-medium text-orange-800">Без остатка</div>
            <div className="text-2xl font-bold text-orange-600">{totalWbItems - itemsWithStock}</div>
          </div>
        </div>
        {totalWbItems === 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>В таблице остатков WB нет данных!</strong> Импортируйте SKU через раздел "Товары" → "Импорт SKU WB".
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
