
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

export const useAutoSync = () => {
  const [status, setStatus] = useState<SyncStatus>(() => {
    // Try to restore state from localStorage
    const savedSettings = localStorage.getItem('autoSyncSettings');
    const defaultStatus = {
      isRunning: false,
      lastProductSyncTime: null,
      lastStockUpdateTime: null,
      nextProductSyncTime: null,
      nextStockUpdateTime: null,
      productSyncInterval: 60,
      stockUpdateInterval: 30,
    };

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        ...defaultStatus,
        productSyncInterval: settings.productSyncInterval === 'never' ? 0 : parseInt(settings.productSyncInterval || '60'),
        stockUpdateInterval: parseInt(settings.stockUpdateInterval || '30'),
      };
    }

    return defaultStatus;
  });

  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { inventory } = useInventory();

  const productSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  // Function to get stock updates from inventory for sending to marketplaces
  const getStockUpdatesFromInventory = useCallback(() => {
    console.log('Getting stock updates from inventory:', inventory);
    const updates = inventory
      .filter(item => {
        const hasWbSku = item.wildberries_sku && item.wildberries_sku.trim() !== '';
        console.log(`Item ${item.sku}: WB SKU = ${item.wildberries_sku}, hasWbSku = ${hasWbSku}, stock = ${item.currentStock}`);
        return hasWbSku;
      })
      .map(item => ({
        nm_id: parseInt(item.wildberries_sku!),
        warehouse_id: 1,
        stock: item.currentStock,
        offer_id: item.sku,
        sku: item.sku
      }));
    
    console.log('Prepared stock updates:', updates);
    return updates;
  }, [inventory]);

  // Perform product synchronization
  const performProductSync = useCallback(async () => {
    if (!isRunningRef.current || status.productSyncInterval === 0) {
      console.log('Product sync skipped - not running or interval is 0');
      return;
    }

    try {
      console.log('Выполняется автосинхронизация товаров...');
      
      // Sync Wildberries
      try {
        await syncWbProducts();
        console.log('Wildberries синхронизация завершена');
      } catch (error) {
        console.error('Ошибка синхронизации Wildberries:', error);
        toast.error('❌ Ошибка синхронизации Wildberries: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
      }
      
      // Sync Ozon
      try {
        await syncOzonProducts();
        console.log('Ozon синхронизация завершена');
      } catch (error) {
        console.error('Ошибка синхронизации Ozon:', error);
        // Don't show Ozon errors as they might be normal if no settings
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
  }, [status.productSyncInterval, syncWbProducts, syncOzonProducts]);

  // Perform stock update
  const performStockUpdate = useCallback(async () => {
    if (!isRunningRef.current) {
      console.log('Stock update skipped - not running');
      return;
    }

    try {
      console.log('Выполняется автообновление остатков...');
      const stockUpdates = getStockUpdatesFromInventory();
      
      if (stockUpdates.length === 0) {
        console.log('Нет товаров с Wildberries SKU для обновления остатков');
        const now = new Date();
        setStatus(prev => ({
          ...prev,
          lastStockUpdateTime: now,
          nextStockUpdateTime: new Date(now.getTime() + prev.stockUpdateInterval * 60 * 1000)
        }));
        return;
      }

      console.log('Updating stock for items:', stockUpdates);

      // Update Wildberries stock
      try {
        await updateWbStock(stockUpdates);
        console.log('Остатки Wildberries обновлены');
      } catch (error) {
        console.error('Ошибка обновления остатков Wildberries:', error);
        toast.error('❌ Ошибка обновления остатков Wildberries: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
      }
      
      // Update Ozon stock
      try {
        await updateOzonStock(stockUpdates);
        console.log('Остатки Ozon обновлены');
      } catch (error) {
        console.error('Ошибка обновления остатков Ozon:', error);
        // Don't show Ozon errors as they might be normal if no settings
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
  }, [getStockUpdatesFromInventory, updateWbStock, updateOzonStock]);

  // Start auto-sync
  const startAutoSync = useCallback(() => {
    if (isRunningRef.current) {
      console.log('Auto-sync already running');
      return;
    }

    console.log('Запуск автосинхронизации...');
    isRunningRef.current = true;
    setStatus(prev => ({ ...prev, isRunning: true }));

    // Perform first syncs immediately
    if (status.productSyncInterval > 0) {
      performProductSync();
    }
    performStockUpdate();

    // Set intervals
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

    // Set next execution times
    const now = new Date();
    setStatus(prev => ({
      ...prev,
      nextProductSyncTime: prev.productSyncInterval > 0 ? new Date(now.getTime() + prev.productSyncInterval * 60 * 1000) : null,
      nextStockUpdateTime: new Date(now.getTime() + prev.stockUpdateInterval * 60 * 1000)
    }));

    toast.success('✅ Автосинхронизация запущена');
  }, [status.productSyncInterval, status.stockUpdateInterval, performProductSync, performStockUpdate]);

  // Stop auto-sync
  const stopAutoSync = useCallback(() => {
    console.log('Остановка автосинхронизации...');
    
    isRunningRef.current = false;

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

  // Update intervals
  const updateIntervals = useCallback((productInterval: number, stockInterval: number) => {
    console.log('Updating intervals:', { productInterval, stockInterval });
    
    setStatus(prev => ({
      ...prev,
      productSyncInterval: productInterval,
      stockUpdateInterval: stockInterval
    }));

    // If sync is running, restart with new intervals
    if (isRunningRef.current) {
      console.log('Restarting auto-sync with new intervals');
      stopAutoSync();
      // Use setTimeout to ensure state updates properly
      setTimeout(() => {
        startAutoSync();
      }, 1000);
    }
  }, [stopAutoSync, startAutoSync]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
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
