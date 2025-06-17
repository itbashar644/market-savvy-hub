
import { useState, useCallback, useEffect, useRef } from 'react';
import { useWildberriesSync } from './useWildberriesSync';
import { useWildberriesStockUpdate } from './useWildberriesStockUpdate';
import { useInventory } from './useInventory';
import { toast } from 'sonner';

interface SyncStatus {
  isRunning: boolean;
  lastProductSyncTime: Date | null;
  lastStockUpdateTime: Date | null;
  nextProductSyncTime: Date | null;
  nextStockUpdateTime: Date | null;
  productSyncInterval: number; // в минутах
  stockUpdateInterval: number; // в минутах
}

export const useUnifiedAutoSync = () => {
  const [status, setStatus] = useState<SyncStatus>({
    isRunning: false,
    lastProductSyncTime: null,
    lastStockUpdateTime: null,
    nextProductSyncTime: null,
    nextStockUpdateTime: null,
    productSyncInterval: 60,
    stockUpdateInterval: 30,
  });

  const { syncProducts } = useWildberriesSync();
  const { updateStock } = useWildberriesStockUpdate();
  const { inventory } = useInventory();

  const productSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для получения остатков из inventory для отправки на маркетплейс
  const getStockUpdatesFromInventory = useCallback(() => {
    return inventory
      .filter(item => item.wildberries_sku) // Только товары с Wildberries SKU
      .map(item => ({
        nm_id: parseInt(item.wildberries_sku!),
        warehouse_id: 1, // По умолчанию склад 1
        stock: item.currentStock
      }));
  }, [inventory]);

  // Выполнение синхронизации товаров
  const performProductSync = useCallback(async () => {
    if (!status.isRunning) return;

    try {
      console.log('Выполняется автосинхронизация товаров...');
      await syncProducts();
      
      const now = new Date();
      setStatus(prev => ({
        ...prev,
        lastProductSyncTime: now,
        nextProductSyncTime: new Date(now.getTime() + prev.productSyncInterval * 60 * 1000)
      }));

      toast.success('✅ Автосинхронизация товаров выполнена');
    } catch (error) {
      console.error('Ошибка автосинхронизации товаров:', error);
      toast.error('❌ Ошибка автосинхронизации товаров: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  }, [status.isRunning, syncProducts]);

  // Выполнение обновления остатков
  const performStockUpdate = useCallback(async () => {
    if (!status.isRunning) return;

    try {
      console.log('Выполняется автообновление остатков...');
      const stockUpdates = getStockUpdatesFromInventory();
      
      if (stockUpdates.length === 0) {
        console.log('Нет товаров с Wildberries SKU для обновления остатков');
        return;
      }

      await updateStock(stockUpdates);
      
      const now = new Date();
      setStatus(prev => ({
        ...prev,
        lastStockUpdateTime: now,
        nextStockUpdateTime: new Date(now.getTime() + prev.stockUpdateInterval * 60 * 1000)
      }));

      toast.success(`✅ Автообновление остатков выполнено (${stockUpdates.length} товаров)`);
    } catch (error) {
      console.error('Ошибка автообновления остатков:', error);
      toast.error('❌ Ошибка автообновления остатков: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  }, [status.isRunning, getStockUpdatesFromInventory, updateStock]);

  // Запуск автосинхронизации
  const startAutoSync = useCallback(() => {
    if (status.isRunning) return;

    console.log('Запуск unified автосинхронизации...');
    setStatus(prev => ({ ...prev, isRunning: true }));

    // Выполняем первую синхронизацию сразу
    performProductSync();
    performStockUpdate();

    // Устанавливаем интервалы
    productSyncIntervalRef.current = setInterval(
      performProductSync,
      status.productSyncInterval * 60 * 1000
    );

    stockUpdateIntervalRef.current = setInterval(
      performStockUpdate,
      status.stockUpdateInterval * 60 * 1000
    );

    // Устанавливаем времена следующих выполнений
    const now = new Date();
    setStatus(prev => ({
      ...prev,
      nextProductSyncTime: new Date(now.getTime() + prev.productSyncInterval * 60 * 1000),
      nextStockUpdateTime: new Date(now.getTime() + prev.stockUpdateInterval * 60 * 1000)
    }));

    toast.success('✅ Unified автосинхронизация запущена');
  }, [status.isRunning, status.productSyncInterval, status.stockUpdateInterval, performProductSync, performStockUpdate]);

  // Остановка автосинхронизации
  const stopAutoSync = useCallback(() => {
    console.log('Остановка unified автосинхронизации...');
    
    if (productSyncIntervalRef.current) {
      clearInterval(productSyncIntervalRef.current);
      productSyncIntervalRef.current = null;
    }

    if (stockUpdateIntervalRef.current) {
      clearInterval(stockUpdateIntervalRef.current);
      stockUpdateIntervalRef.current = null;
    }

    setStatus(prev => ({
      ...prev,
      isRunning: false,
      nextProductSyncTime: null,
      nextStockUpdateTime: null
    }));

    toast.info('⏸️ Unified автосинхронизация остановлена');
  }, []);

  // Обновление интервалов
  const updateIntervals = useCallback((productInterval: number, stockInterval: number) => {
    setStatus(prev => ({
      ...prev,
      productSyncInterval: productInterval,
      stockUpdateInterval: stockInterval
    }));

    // Если синхронизация запущена, перезапускаем с новыми интервалами
    if (status.isRunning) {
      stopAutoSync();
      setTimeout(() => startAutoSync(), 1000);
    }
  }, [status.isRunning, stopAutoSync, startAutoSync]);

  // Очистка интервалов при размонтировании
  useEffect(() => {
    return () => {
      if (productSyncIntervalRef.current) {
        clearInterval(productSyncIntervalRef.current);
      }
      if (stockUpdateIntervalRef.current) {
        clearInterval(stockUpdateIntervalRef.current);
      }
    };
  }, []);

  return {
    status,
    startAutoSync,
    stopAutoSync,
    updateIntervals,
    performProductSync,
    performStockUpdate,
    getStockUpdatesFromInventory,
  };
};
