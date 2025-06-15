
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UpdateRulesProps {
  syncInterval: number;
  setSyncInterval: (minutes: number) => void;
  autoSyncEnabled: boolean;
}

const UpdateRules: React.FC<UpdateRulesProps> = ({ 
  syncInterval, 
  setSyncInterval, 
  autoSyncEnabled 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Правила автоматического обновления</CardTitle>
        <CardDescription>Настройте условия для автоматической синхронизации данных</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sync-interval" className="text-sm font-medium">
              Интервал автосинхронизации остатков:
            </Label>
            <select 
              id="sync-interval"
              className="w-full p-2 border rounded-md bg-white"
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              disabled={!autoSyncEnabled}
            >
              <option value={15}>15 минут</option>
              <option value={30}>30 минут</option>
              <option value={60}>1 час</option>
              <option value={180}>3 часа</option>
              <option value={360}>6 часов</option>
              <option value={720}>12 часов</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Статус автосинхронизации:</Label>
            <p className={`text-sm font-medium ${autoSyncEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {autoSyncEnabled ? `Включена (каждые ${syncInterval} мин)` : 'Отключена'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch defaultChecked />
          <span className="text-sm">Уведомлять об ошибках синхронизации</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch defaultChecked />
          <span className="text-sm">Отправлять отчеты о синхронизации на email</span>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Информация</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Автосинхронизация работает только при включенном переключателе</li>
            <li>• Синхронизация происходит для всех подключенных маркетплейсов</li>
            <li>• При ошибках синхронизации вы получите уведомление</li>
            <li>• Время последней автосинхронизации отображается в шапке страницы</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateRules;
