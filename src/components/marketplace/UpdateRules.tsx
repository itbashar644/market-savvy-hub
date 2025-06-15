
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const UpdateRules = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Правила автоматического обновления</CardTitle>
        <CardDescription>Настройте условия для автоматической синхронизации данных</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Обновлять остатки каждые:</label>
            <select className="w-full p-2 border rounded-md bg-white">
              <option>15 минут</option>
              <option>30 минут</option>
              <option>1 час</option>
              <option>3 часа</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Обновлять цены каждые:</label>
            <select className="w-full p-2 border rounded-md bg-white">
              <option>1 час</option>
              <option>3 часа</option>
              <option>6 часов</option>
              <option>12 часов</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch defaultChecked />
          <span className="text-sm">Автоматически загружать новые заказы</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch defaultChecked />
          <span className="text-sm">Уведомлять об ошибках синхронизации</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateRules;
