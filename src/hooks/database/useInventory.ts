
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryHistory } from '@/types/database';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const refreshInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем данные из products таблицы и формируем inventory
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products for inventory:', productsError);
        setError('Ошибка загрузки товаров');
        return;
      }

      // Преобразуем products в InventoryItem формат
      const inventoryItems: InventoryItem[] = (products || []).map(product => ({
        id: product.id,
        productId: product.id,
        name: product.title,
        sku: product.article_number || product.id,
        category: product.category,
        currentStock: product.stock_quantity || 0,
        minStock: 5, // Значение по умолчанию
        maxStock: 100, // Значение по умолчанию
        price: Number(product.price),
        supplier: 'Default', // Значение по умолчанию
        lastRestocked: product.updated_at,
        status: product.stock_quantity <= 0 ? 'out_of_stock' : 
                product.stock_quantity <= 5 ? 'low_stock' : 'in_stock',
        wildberries_sku: product.wildberries_sku || undefined,
      }));

      console.log('Inventory items loaded:', inventoryItems);
      console.log('Items with Wildberries SKU:', inventoryItems.filter(item => item.wildberries_sku));
      
      setInventory(inventoryItems);
    } catch (error) {
      console.error('Error in refreshInventory:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const setupSubscription = async () => {
      await refreshInventory();
      
      if (!mounted) return;

      try {
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        channelRef.current = supabase
          .channel(`inventory_updates_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'products'
            },
            () => {
              if (mounted) {
                console.log('Products updated, refreshing inventory...');
                refreshInventory();
              }
            }
          );

        await channelRef.current.subscribe();
        console.log('Inventory subscription established');
      } catch (error) {
        console.error('Error setting up inventory subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log('Inventory subscription cleaned up');
      }
    };
  }, [refreshInventory]);

  const updateInventoryStock = async (productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string) => {
    try {
      // Обновляем stock_quantity в products таблице
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);

      if (error) {
        console.error('Error updating inventory stock:', error);
        return null;
      }

      // Обновляем локальное состояние
      setInventory(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, currentStock: newStock }
          : item
      ));

      return true;
    } catch (error) {
      console.error('Error in updateInventoryStock:', error);
      return null;
    }
  };

  const bulkUpdateInventoryStock = async (updates: { sku: string; newStock: number }[]) => {
    try {
      const results = [];
      
      for (const update of updates) {
        const item = inventory.find(item => item.sku === update.sku);
        if (item) {
          const result = await updateInventoryStock(item.productId, update.newStock);
          if (result) {
            results.push(item);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulkUpdateInventoryStock:', error);
      return [];
    }
  };

  return {
    inventory,
    loading,
    error,
    updateInventoryStock,
    bulkUpdateInventoryStock,
    refreshInventory,
  };
};
