
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryHistory } from '@/types/database';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      // Transform Supabase data to match our InventoryItem type
      const transformedData: InventoryItem[] = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        maxStock: item.max_stock,
        price: item.price,
        supplier: item.supplier || '',
        lastRestocked: item.last_restocked,
        status: item.status as InventoryItem['status'],
      }));

      setInventory(transformedData);
    } catch (error) {
      console.error('Error in refreshInventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const updateStock = async (productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string) => {
    try {
      // Update inventory in Supabase
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: newStock,
          last_restocked: new Date().toISOString()
        })
        .eq('product_id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating inventory:', error);
        return null;
      }

      // Add history record
      const inventoryItem = inventory.find(item => item.productId === productId);
      if (inventoryItem) {
        await supabase
          .from('inventory_history')
          .insert({
            product_id: productId,
            product_name: inventoryItem.name,
            sku: inventoryItem.sku,
            previous_stock: inventoryItem.currentStock,
            new_stock: newStock,
            change_amount: newStock - inventoryItem.currentStock,
            change_type: changeType,
            reason: reason,
            user_name: 'Администратор',
          });
      }

      // Refresh inventory to get updated data
      await refreshInventory();

      return data;
    } catch (error) {
      console.error('Error in updateStock:', error);
      return null;
    }
  };

  const bulkUpdateStock = async (updates: { sku: string; newStock: number }[]) => {
    try {
      for (const update of updates) {
        const inventoryItem = inventory.find(item => item.sku === update.sku);
        if (inventoryItem) {
          await updateStock(inventoryItem.productId, update.newStock, 'manual', 'Массовое обновление');
        }
      }
    } catch (error) {
      console.error('Error in bulkUpdateStock:', error);
    }
  };

  return {
    inventory,
    loading,
    updateStock,
    bulkUpdateStock,
    refreshInventory,
  };
};
