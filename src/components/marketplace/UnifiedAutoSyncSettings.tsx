
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Settings, Play, Pause, RefreshCw, Upload, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useUnifiedAutoSync } from '@/hooks/database/useUnifiedAutoSync';

const UnifiedAutoSyncSettings = () => {
  const {
    status,
    startAutoSync,
    stopAutoSync,
    updateIntervals,
    performProductSync,
    performStockUpdate,
    getStockUpdatesFromInventory,
  } = useUnifiedAutoSync();

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [productSyncInterval, setProductSyncInterval] = useState('60');
  const [stockUpdateInterval, setStockUpdateInterval] = useState('30');

  // Загрузка сохраненных настроек при инициализации
  useEffect(() => {
    const savedSettings = localStorage.getItem('unifiedAutoSyncSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoSyncEnabled(settings.autoSyncEnabled || false);
      setProductSyncInterval(settings.productSyncInterval || '60');
      setStockUpdateInterval(settings.stockUpdateInterval || '30');
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      autoSyncEnabled,
      productSyncInterval,
      stockUpdateInterval,
    };
    
    localStorage.setItem('unifiedAutoSyncSettings', JSON.stringify(settings));
    updateIntervals(parseInt(productSyncInterval), parseInt(stockUpdateInterval));
    toast.success('✅ Настройки автоматической синхронизации сохранены');
  };

  const toggleAutoSync = () => {
    if (status.isRunning) {
      stopAutoSync();
    } else {
      startAutoSync();
    }
  };

  const handleManualProductSync = async () => {
    try {
      await performProductSync();
    } catch (error) {
      console.error('Manual product sync error:', error);
    }
  };

  const handleManualStockUpdate = async () => {
    try {
      await performStockUpdate();
    } catch (error) {
      console.error('Manual stock update error:', error);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Не запланировано';
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const stockUpdatesCount = getStockUpdatesFromInventory().length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Unified управление автосинхронизацией
          </CardTitle>
          <CardDescription>
            Единое управление автоматической синхронизацией товаров и остатков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Статус системы */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Общий статус</span>
                <div className={`px-2 py-1 rounded text-xs ${status.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {status.isRunning ? '▶️ Активна' : '⏸️ Остановлена'}
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Товаров с WB SKU: {stockUpdatesCount}</div>
                <div>Интервал синхронизации: {status.productSyncInterval} мин</div>
                <div>Интервал остатков: {status.stockUpdateInterval} мин</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Синхронизация товаров</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Последняя: {formatTime(status.lastProductSyncTime)}</div>
                <div>Следующая: {formatTime(status.nextProductSyncTime)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Обновление остатков</span>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Последнее: {formatTime(status.lastStockUpdateTime)}</div>
                <div>Следующее: {formatTime(status.nextStockUpdateTime)}</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex gap-2">
                <Button 
                  onClick={handleManualProductSync}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={status.isRunning}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Синхр. товары
                </Button>
                <Button 
                  onClick={handleManualStockUpdate}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={status.isRunning}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Обновить остатки
                </Button>
              </div>
            </div>
          </div>

          {/* Настройки */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Включить автосинхронизацию</label>
                <p className="text-xs text-gray-600">Автоматически синхронизировать товары и остатки</p>
              </div>
              <Switch 
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
              />
            </div>

            {autoSyncEnabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Интервал синхронизации товаров</label>
                    <Select value={productSyncInterval} onValueChange={setProductSyncInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Каждые 30 минут</SelectItem>
                        <SelectItem value="60">Каждый час</SelectItem>
                        <SelectItem value="180">Каждые 3 часа</SelectItem>
                        <SelectItem value="360">Каждые 6 часов</SelectItem>
                        <SelectItem value="720">Каждые 12 часов</SelectItem>
                        <SelectItem value="1440">Каждые 24 часа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Интервал обновления остатков</label>
                    <Select value={stockUpdateInterval} onValueChange={setStockUpdateInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Каждые 5 минут</SelectItem>
                        <SelectItem value="15">Каждые 15 минут</SelectItem>
                        <SelectItem value="30">Каждые 30 минут</SelectItem>
                        <SelectItem value="60">Каждый час</SelectItem>
                        <SelectItem value="120">Каждые 2 часа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={toggleAutoSync}
                    variant={status.isRunning ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {status.isRunning ? (
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

export default UnifiedAutoSyncSettings;
