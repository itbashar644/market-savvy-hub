
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const OrdersHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
        <p className="text-gray-600 mt-1">Просматривайте и управляйте заказами клиентов</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Новый заказ
      </Button>
    </div>
  );
};

export default OrdersHeader;
