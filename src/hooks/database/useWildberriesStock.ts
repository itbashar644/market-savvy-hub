
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WildberriesStockItem {
  id: string;
  product_id: string;
  internal_sku: string;
  wildberries_sku: string;
  stock_quantity: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export const useWildberriesStock = () => {
  const [stockItems, setStockItems] = useState<WildberriesStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const fetchStockItems = async () => {
    try {
      console.log('🔍 [useWildberriesStock] Загружаем остатки WB из Supabase...');
      const { data, error } = await supabase
        .from('wildberries_stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [useWildberriesStock] Ошибка загрузки остатков WB:', error);
        throw error;
      }

      console.log('✅ [useWildberriesStock] Загружено остатков WB:', data?.length || 0);
      
      if (isMountedRef.current) {
        setStockItems(data || []);
      }
      
      return data || [];
    } catch (error) {
      console.error('💥 [useWildberriesStock] Критическая ошибка:', error);
      toast.error('Ошибка загрузки остатков Wildberries');
      return [];
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addOrUpdateStockItem = async (data: {
    product_id?: string;
    internal_sku: string;
    wildberries_sku: string;
    stock_quantity: number;
  }) => {
    try {
      console.log('🔄 [useWildberriesStock] Добавляем/обновляем остаток WB:', data);
      
      // Проверяем, существует ли уже запись с таким internal_sku
      const { data: existing } = await supabase
        .from('wildberries_stock')
        .select('*')
        .eq('internal_sku', data.internal_sku)
        .single();

      if (existing) {
        // Обновляем существующую запись
        const { error } = await supabase
          .from('wildberries_stock')
          .update({
            wildberries_sku: data.wildberries_sku,
            stock_quantity: data.stock_quantity,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        console.log('✅ [useWildberriesStock] Остаток WB обновлен:', existing.id);
      } else {
        // Создаем новую запись
        const { error } = await supabase
          .from('wildberries_stock')
          .insert({
            product_id: data.product_id,
            internal_sku: data.internal_sku,
            wildberries_sku: data.wildberries_sku,
            stock_quantity: data.stock_quantity
          });

        if (error) throw error;
        console.log('✅ [useWildberriesStock] Новый остаток WB добавлен');
      }

      await fetchStockItems();
      return true;
    } catch (error) {
      console.error('❌ [useWildberriesStock] Ошибка добавления/обновления остатка WB:', error);
      toast.error('Ошибка сохранения остатка Wildberries');
      return false;
    }
  };

  const bulkUpdateFromSkuMapping = async (skuMappings: Array<{ internal_sku: string; wildberries_sku: string }>) => {
    try {
      console.log('📦 [useWildberriesStock] Массовое обновление SKU WB:', skuMappings.length);
      
      const results = { success: 0, failed: 0 };
      
      for (const mapping of skuMappings) {
        try {
          // Ищем остаток в inventory по internal_sku (article_number)
          const { data: inventoryItem } = await supabase
            .from('inventory')
            .select('current_stock')
            .eq('sku', mapping.internal_sku)
            .single();

          const currentStock = inventoryItem?.current_stock || 0;
          console.log(`📋 [useWildberriesStock] Найден остаток для ${mapping.internal_sku}: ${currentStock}`);

          await addOrUpdateStockItem({
            internal_sku: mapping.internal_sku,
            wildberries_sku: mapping.wildberries_sku,
            stock_quantity: currentStock
          });
          results.success++;
        } catch (error) {
          console.error(`❌ [useWildberriesStock] Ошибка обновления ${mapping.internal_sku}:`, error);
          results.failed++;
        }
      }
      
      console.log('📊 [useWildberriesStock] Результаты массового обновления:', results);
      return results;
    } catch (error) {
      console.error('💥 [useWildberriesStock] Критическая ошибка массового обновления:', error);
      throw error;
    }
  };

  const updateStockQuantity = async (id: string, newQuantity: number) => {
    try {
      console.log(`🔄 [useWildberriesStock] Обновляем количество для ${id}:`, newQuantity);
      
      const { error } = await supabase
        .from('wildberries_stock')
        .update({
          stock_quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchStockItems();
      console.log('✅ [useWildberriesStock] Количество обновлено');
      return true;
    } catch (error) {
      console.error('❌ [useWildberriesStock] Ошибка обновления количества:', error);
      toast.error('Ошибка обновления количества');
      return false;
    }
  };

  const deleteStockItem = async (id: string) => {
    try {
      console.log(`🗑️ [useWildberriesStock] Удаляем остаток WB ${id}...`);
      const { error } = await supabase
        .from('wildberries_stock')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchStockItems();
      toast.success('Остаток Wildberries удален');
      return true;
    } catch (error) {
      console.error('❌ [useWildberriesStock] Ошибка удаления остатка WB:', error);
      toast.error('Ошибка удаления остатка Wildberries');
      return false;
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
        console.log('🔄 [useWildberriesStock] Отписываемся от канала:', subscriptionRef.current);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Подписка на изменения в реальном времени
  useEffect(() => {
    if (stockItems.length >= 0 && !subscriptionRef.current) {
      const channelName = `wildberries-stock-realtime-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔄 [useWildberriesStock] Создаем подписку на канал:', channelName);
      
      subscriptionRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wildberries_stock' },
          (payload) => {
            console.log('🔄 [useWildberriesStock] Изменение в wildberries_stock:', payload);
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
    addOrUpdateStockItem,
    bulkUpdateFromSkuMapping,
    updateStockQuantity,
    deleteStockItem,
    refreshStockItems: fetchStockItems
  };
};
