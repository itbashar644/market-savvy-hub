
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDataSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger data refresh when coming back online
      refreshAllData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshAllData = async () => {
    try {
      // Force refresh of all critical data
      await Promise.all([
        supabase.from('products').select('*').limit(1),
        supabase.from('orders').select('*').limit(1),
        supabase.from('inventory').select('*').limit(1),
        supabase.from('profiles').select('*').limit(1),
      ]);
      
      setLastSync(new Date());
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  // Auto-refresh data every 5 minutes when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(refreshAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isOnline]);

  return {
    isOnline,
    lastSync,
    refreshAllData,
  };
};
