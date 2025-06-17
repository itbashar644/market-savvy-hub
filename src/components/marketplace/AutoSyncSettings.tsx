
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, Play, Pause, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAutoSync } from '@/hooks/database/useAutoSync';
import AutoSyncStatus from './AutoSyncStatus';
import AutoSyncControls from './AutoSyncControls';

const AutoSyncSettings = () => {
  const {
    status,
    startAutoSync,
    stopAutoSync,
    updateIntervals,
  } = useAutoSync();

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(status.isRunning);
  const [productSyncInterval, setProductSyncInterval] = useState('60');
  const [stockUpdateInterval, setStockUpdateInterval] = useState('30');

  // Sync local state with auto-sync status
  useEffect(() => {
    setAutoSyncEnabled(status.isRunning);
  }, [status.isRunning]);

  // Load saved settings on initialization
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoSyncSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setProductSyncInterval(settings.productSyncInterval || '60');
      setStockUpdateInterval(settings.stockUpdateInterval || '30');
      
      // If auto sync was enabled and settings exist, start it
      if (settings.autoSyncEnabled && !status.isRunning) {
        updateIntervals(
          settings.productSyncInterval === 'never' ? 0 : parseInt(settings.productSyncInterval), 
          parseInt(settings.stockUpdateInterval)
        );
        setTimeout(() => startAutoSync(), 500);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      autoSyncEnabled,
      productSyncInterval,
      stockUpdateInterval,
    };
    
    localStorage.setItem('autoSyncSettings', JSON.stringify(settings));
    
    // Update intervals without restarting if already running
    updateIntervals(
      productSyncInterval === 'never' ? 0 : parseInt(productSyncInterval), 
      parseInt(stockUpdateInterval)
    );
    
    // Only toggle auto-sync if the enabled state changed
    if (autoSyncEnabled && !status.isRunning) {
      startAutoSync();
    } else if (!autoSyncEnabled && status.isRunning) {
      stopAutoSync();
    }
    
    toast.success('✅ Настройки автоматической синхронизации сохранены');
  };

  const toggleAutoSync = () => {
    if (status.isRunning) {
      stopAutoSync();
      setAutoSyncEnabled(false);
    } else {
      startAutoSync();
      setAutoSyncEnabled(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Автосинхронизация
          </CardTitle>
          <CardDescription>
            Управление автоматической синхронизацией товаров и остатков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AutoSyncStatus status={status} />
          
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
                        <SelectItem value="never">Никогда</SelectItem>
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

          <AutoSyncControls />

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
