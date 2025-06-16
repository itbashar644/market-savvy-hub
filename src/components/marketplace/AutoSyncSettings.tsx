
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AutoSyncSettings = () => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState('60'); // в минутах
  const [stockUpdateEnabled, setStockUpdateEnabled] = useState(false);
  const [stockUpdateInterval, setStockUpdateInterval] = useState('30'); // в минутах

  const handleSaveSettings = () => {
    // Здесь можно сохранить настройки в localStorage или базу данных
    const settings = {
      autoSyncEnabled,
      syncInterval,
      stockUpdateEnabled,
      stockUpdateInterval,
    };
    
    localStorage.setItem('marketplaceSyncSettings', JSON.stringify(settings));
    toast.success('✅ Настройки автоматической синхронизации сохранены');
  };

  // Загрузка сохраненных настроек при инициализации
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('marketplaceSyncSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoSyncEnabled(settings.autoSyncEnabled || false);
      setSyncInterval(settings.syncInterval || '60');
      setStockUpdateEnabled(settings.stockUpdateEnabled || false);
      setStockUpdateInterval(settings.stockUpdateInterval || '30');
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Автоматическая синхронизация
        </CardTitle>
        <CardDescription>
          Настройте автоматическую синхронизацию данных с маркетплейсами
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Автосинхронизация товаров</label>
              <p className="text-xs text-gray-600">Автоматически синхронизировать список товаров</p>
            </div>
            <Switch 
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>

          {autoSyncEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Интервал синхронизации</label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Каждые 15 минут</SelectItem>
                  <SelectItem value="30">Каждые 30 минут</SelectItem>
                  <SelectItem value="60">Каждый час</SelectItem>
                  <SelectItem value="180">Каждые 3 часа</SelectItem>
                  <SelectItem value="360">Каждые 6 часов</SelectItem>
                  <SelectItem value="720">Каждые 12 часов</SelectItem>
                  <SelectItem value="1440">Каждые 24 часа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Автообновление остатков</label>
                <p className="text-xs text-gray-600">Автоматически обновлять остатки товаров</p>
              </div>
              <Switch 
                checked={stockUpdateEnabled}
                onCheckedChange={setStockUpdateEnabled}
              />
            </div>

            {stockUpdateEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Интервал обновления остатков</label>
                <Select value={stockUpdateInterval} onValueChange={setStockUpdateInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Каждые 15 минут</SelectItem>
                    <SelectItem value="30">Каждые 30 минут</SelectItem>
                    <SelectItem value="60">Каждый час</SelectItem>
                    <SelectItem value="120">Каждые 2 часа</SelectItem>
                    <SelectItem value="240">Каждые 4 часа</SelectItem>
                    <SelectItem value="480">Каждые 8 часов</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <Button onClick={handleSaveSettings} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoSyncSettings;
