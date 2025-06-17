
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useInventory } from '@/hooks/database/useInventory';

const InventoryStats = () => {
  const { inventory } = useInventory();

  const totalItems = inventory.length;
  const itemsWithWbSku = inventory.filter(item => item.wildberries_sku && item.wildberries_sku.trim() !== '').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Статистика товаров
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800">Всего товаров</div>
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-800">С Wildberries SKU</div>
            <div className="text-2xl font-bold text-green-600">{itemsWithWbSku}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="font-medium text-orange-800">Без SKU</div>
            <div className="text-2xl font-bold text-orange-600">{totalItems - itemsWithWbSku}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStats;
