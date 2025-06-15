
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

const OrdersEmptyState = () => {
  return (
    <div className="text-center py-12">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заказов</h3>
      <p className="text-gray-500 mb-4">Заказы появятся здесь после их создания</p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Создать первый заказ
      </Button>
    </div>
  );
};

export default OrdersEmptyState;
