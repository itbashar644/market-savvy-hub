
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Settings, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';

const AutoSyncSettings = () => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState('60');
  const [stockUpdateEnabled, setStockUpdateEnabled] = useState(false);
  const [stockUpdateInterval, setStockUpdateInterval] = useState('30');
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [nextSyncTime, setNextSyncTime] = useState<Date | null>(null);

  const { syncProducts } = useWildberriesSync();

  // Функция для выполнения автосинхронизации
  const performAutoSync = useCallback(async () => {
    if (!autoSyncEnabled || !isRunning) return;

    try {
      console.log('Выполняется автосинхронизация...');
      await syncProducts();
      setLastSyncTime(new Date());
      toast.success('✅ Автосинхронизация выполнена успешно');
    } catch (error) {
      console.error('Ошибка автосинхронизации:', error);
      toast.error('❌ Ошибка автосинхронизации: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  }, [autoSyncEnabled, isRunning, syncProducts]);

  // Эффект для управления интервалом автосинхронизации
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (autoSyncEnabled && isRunning) {
      const intervalMs = parseInt(syncInterval) * 60 * 1000; // Преобразуем минуты в миллисекунды
      
      // Устанавливаем время следующей синхронизации
      setNextSyncTime(new Date(Date.now() + intervalMs));
      
      intervalId = setInterval(() => {
        performAutoSync();
        // Обновляем время следующей синхронизации
        setNextSyncTime(new Date(Date.now() + intervalMs));
      }, intervalMs);

      console.log(`Автосинхронизация запущена с интервалом ${syncInterval} минут`);
    } else {
      setNextSyncTime(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Автосинхронизация остановлена');
      }
    };
  }, [autoSyncEnabled, isRunning, syncInterval, performAutoSync]);

  const handleSaveSettings = () => {
    const settings = {
      autoSyncEnabled,
      syncInterval,
      stockUpdateEnabled,
      stockUpdateInterval,
      isRunning
    };
    
    localStorage.setItem('marketplaceSyncSettings', JSON.stringify(settings));
    toast.success('✅ Настройки автоматической синхронизации сохранены');
  };

  const toggleAutoSync = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      toast.success('▶️ Автосинхронизация запущена');
    } else {
      toast.info('⏸️ Автосинхронизация остановлена');
    }
  };

  // Загрузка сохраненных настроек при инициализации
  useEffect(() => {
    const savedSettings = localStorage.getItem('marketplaceSyncSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoSyncEnabled(settings.autoSyncEnabled || false);
      setSyncInterval(settings.syncInterval || '60');
      setStockUpdateEnabled(settings.stockUpdateEnabled || false);
      setStockUpdateInterval(settings.stockUpdateInterval || '30');
      setIsRunning(settings.isRunning || false);
    }
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Не запланировано';
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
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
          {/* Статус автосинхронизации */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Статус автосинхронизации</span>
              <div className={`px-2 py-1 rounded text-xs ${isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {isRunning ? '▶️ Активна' : '⏸️ Остановлена'}
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Последняя синхронизация: {formatTime(lastSyncTime)}</div>
              <div>Следующая синхронизация: {formatTime(nextSyncTime)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Включить автосинхронизацию</label>
                <p className="text-xs text-gray-600">Автоматически синхронизировать список товаров</p>
              </div>
              <Switch 
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
              />
            </div>

            {autoSyncEnabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Интервал синхронизации</label>
                  <Select value={syncInterval} onValueChange={setSyncInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Каждые 5 минут</SelectItem>
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

                <div className="flex gap-2">
                  <Button 
                    onClick={toggleAutoSync}
                    variant={isRunning ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Остановить автосинхронизацию
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Запустить автосинхронизацию
                      </>
                    )}
                  </Button>
                </div>
              </>
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
    </div>
  );
};

export default AutoSyncSettings;
