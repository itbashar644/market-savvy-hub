
import { useState, useCallback } from 'react';
import { useWildberriesSync } from './useWildberriesSync';
import { toast } from 'sonner';

export const useAutoSync = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { syncProducts } = useWildberriesSync();

  const performSync = useCallback(async () => {
    try {
      console.log('Выполняется автосинхронизация...');
      await syncProducts();
      setLastSyncTime(new Date());
      return true;
    } catch (error) {
      console.error('Ошибка автосинхронизации:', error);
      toast.error('❌ Ошибка автосинхронизации: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
      return false;
    }
  }, [syncProducts]);

  const startAutoSync = useCallback((intervalMinutes: number) => {
    if (isRunning) return;
    
    setIsRunning(true);
    
    // Выполняем первую синхронизацию сразу
    performSync();
    
    // Устанавливаем интервал
    const intervalId = setInterval(performSync, intervalMinutes * 60 * 1000);
    
    toast.success(`✅ Автосинхронизация запущена (интервал: ${intervalMinutes} мин)`);
    
    return intervalId;
  }, [isRunning, performSync]);

  const stopAutoSync = useCallback((intervalId?: NodeJS.Timeout) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setIsRunning(false);
    toast.info('⏸️ Автосинхронизация остановлена');
  }, []);

  return {
    isRunning,
    lastSyncTime,
    performSync,
    startAutoSync,
    stopAutoSync,
  };
};
