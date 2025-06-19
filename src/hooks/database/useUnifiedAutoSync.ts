
import { useState, useCallback, useEffect, useRef } from 'react';
import { useWildberriesSync } from './useWildberriesSync';
import { useOzonSync } from './useOzonSync';
import { useWildberriesStockUpdate } from './useWildberriesStockUpdate';
import { useOzonStockUpdate } from './useOzonStockUpdate';
import { useInventory } from './useInventory';
import { toast } from 'sonner';

interface SyncStatus {
  isRunning: boolean;
  lastProductSyncTime: Date | null;
  lastStockUpdateTime: Date | null;
  nextProductSyncTime: Date | null;
  nextStockUpdateTime: Date | null;
  productSyncInterval: number; // в минутах, 0 означает отключено
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

  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { inventory } = useInventory();

  const productSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для получения остатков из inventory для отправки на маркетплейсы
  const getStockUpdatesFromInventory = useCallback(() => {
    return inventory
      .filter(item => item.wildberries_sku) // Только товары с Wildberries SKU
      .map(item => ({
        nm_id: parseInt(item.wildberries_sku!),
        warehouse_id: 1, // По умолчанию склад 1
        stock: item.currentStock,
        offer_id: item.sku, // Для Ozon
        sku: item.sku
      }));
  }, [inventory]);

  // Выполнение синхронизации товаров
  const performProductSync = useCallback(async () => {
    if (!status.isRunning || status.productSyncInterval === 0) return;

    try {
      console.log('Выполняется автосинхронизация товаров...');
      
      // Синхронизируем Wildberries
      try {
        await syncWbProducts();
        console.log('Wildberries синхронизация завершена');
      } catch (error) {
        console.error('Ошибка синхронизации Wildberries:', error);
        toast.error('❌ Ошибка синхронизации Wildberries: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
      }
      
      // Синхронизируем Ozon
      try {
        await syncOzonProducts();
        console.log('Ozon синхронизация завершена');
      } catch (error) {
        console.error('Ошибка синхронизации Ozon:', error);
        // Не показываем ошибку для Ozon, так как это может быть нормально если нет настроек
      }
      
      const now = new Date();
      setStatus(prev => ({
        ...prev,
        lastProductSyncTime: now,
        nextProductSyncTime: prev.productSyncInterval > 0 ? new Date(now.getTime() + prev.productSyncInterval * 60 * 1000) : null
      }));

      toast.success('✅ Автосинхронизация товаров выполнена');
    } catch (error) {
      console.error('Ошибка автосинхронизации товаров:', error);
      toast.error('❌ Ошибка автосинхронизации товаров: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  }, [status.isRunning, status.productSyncInterval, syncWbProducts, syncOzonProducts]);

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

      // Обновляем остатки на Wildberries
      try {
        await updateWbStock(stockUpdates);
        console.log('Остатки Wildberries обновлены');
      } catch (error) {
        console.error('Ошибка обновления остатков Wildberries:', error);
        toast.error('❌ Ошибка обновления остатков Wildberries: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
      }
      
      // Обновляем остатки на Ozon
      try {
        await updateOzonStock(stockUpdates);
        console.log('Остатки Ozon обновлены');
      } catch (error) {
        console.error('Ошибка обновления остатков Ozon:', error);
        // Не показываем ошибку для Ozon, так как это может быть нормально если нет настроек
      }
      
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
  }, [status.isRunning, getStockUpdatesFromInventory, updateWbStock, updateOzonStock]);

  // Запуск автосинхронизации
  const startAutoSync = useCallback(() => {
    if (status.isRunning) return;

    console.log('Запуск автосинхронизации...');
    setStatus(prev => ({ ...prev, isRunning: true }));

    // Выполняем первые синхронизации сразу
    if (status.productSyncInterval > 0) {
      performProductSync();
    }
    performStockUpdate();

    // Устанавливаем интервалы
    if (status.productSyncInterval > 0) {
      productSyncIntervalRef.current = setInterval(
        performProductSync,
        status.productSyncInterval * 60 * 1000
      );
    }

    stockUpdateIntervalRef.current = setInterval(
      performStockUpdate,
      status.stockUpdateInterval * 60 * 1000
    );

    // Устанавливаем времена следующих выполнений
    const now = new Date();
    setStatus(prev => ({
      ...prev,
      nextProductSyncTime: prev.productSyncInterval > 0 ? new Date(now.getTime() + prev.productSyncInterval * 60 * 1000) : null,
      nextStockUpdateTime: new Date(now.getTime() + prev.stockUpdateInterval * 60 * 1000)
    }));

    toast.success('✅ Автосинхронизация запущена');
  }, [status.isRunning, status.productSyncInterval, status.stockUpdateInterval, performProductSync, performStockUpdate]);

  // Остановка автосинхронизации
  const stopAutoSync = useCallback(() => {
    console.log('Остановка автосинхронизации...');
    
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

    toast.info('⏸️ Автосинхронизация остановлена');
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
