
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WildberriesStockItem } from './useWildberriesStockOperations';

export const useWildberriesStockData = () => {
  const [stockItems, setStockItems] = useState<WildberriesStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const fetchStockItems = async () => {
    try {
      console.log('🔍 [WildberriesStockData] Загружаем остатки WB из Supabase...');
      const { data, error } = await supabase
        .from('wildberries_stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [WildberriesStockData] Ошибка загрузки остатков WB:', error);
        throw error;
      }

      console.log('✅ [WildberriesStockData] Загружено остатков WB:', data?.length || 0);
      
      if (isMountedRef.current) {
        setStockItems(data || []);
      }
      
      return data || [];
    } catch (error) {
      console.error('💥 [WildberriesStockData] Критическая ошибка:', error);
      toast.error('Ошибка загрузки остатков Wildberries');
      return [];
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeStockItems = async () => {
      await fetchStockItems();
    };
    
    initializeStockItems();
    
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        console.log('🔄 [WildberriesStockData] Отписываемся от канала:', subscriptionRef.current);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Подписка на изменения в реальном времени
  useEffect(() => {
    if (stockItems.length >= 0 && !subscriptionRef.current) {
      const channelName = `wildberries-stock-realtime-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔄 [WildberriesStockData] Создаем подписку на канал:', channelName);
      
      subscriptionRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wildberries_stock' },
          (payload) => {
            console.log('🔄 [WildberriesStockData] Изменение в wildberries_stock:', payload);
            if (isMountedRef.current) {
              fetchStockItems();
            }
          }
        )
        .subscribe();
    }
  }, [stockItems.length]);

  return {
    stockItems,
    loading,
    refreshStockItems: fetchStockItems
  };
};
