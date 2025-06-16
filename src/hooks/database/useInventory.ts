
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryHistory } from '@/types/database';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInventory = async () => {
    try {
      // Получаем данные из таблицы products для создания инвентаря
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('title');

      if (productsError) {
        console.error('Error fetching products for inventory:', productsError);
        return;
      }

      // Преобразуем данные продуктов в формат InventoryItem
      const transformedData: InventoryItem[] = productsData.map(product => {
        let status: InventoryItem['status'] = 'in_stock';
        if (product.stock_quantity <= 0) {
          status = 'out_of_stock';
        } else if (product.stock_quantity <= 5) {
          status = 'low_stock';
        }

        return {
          id: product.id,
          productId: product.id,
          name: product.title,
          sku: product.article_number || product.id, // Используем article_number как SKU
          category: product.category || 'Без категории',
          currentStock: product.stock_quantity || 0,
          minStock: 5, // Минимальный остаток по умолчанию
          maxStock: 100, // Максимальный остаток по умолчанию
          price: product.price || 0,
          supplier: 'По умолчанию',
          lastRestocked: product.updated_at,
          status: status,
        };
      });

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
      // Обновляем остаток в таблице products
      const { data, error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product stock:', error);
        return null;
      }

      // Добавляем запись в историю изменений
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

      // Обновляем локальное состояние
      await refreshInventory();

      return data;
    } catch (error) {
      console.error('Error in updateStock:', error);
      return null;
    }
  };

  const bulkUpdateStock = async (updates: { sku: string; newStock: number }[]) => {
    try {
      console.log('Bulk update received:', updates);
      console.log('Current inventory:', inventory.map(i => ({ sku: i.sku, name: i.name })));
      
      for (const update of updates) {
        const inventoryItem = inventory.find(item => 
          item.sku === update.sku || 
          item.sku === update.sku.toString() ||
          item.productId === update.sku
        );
        
        console.log(`Looking for SKU: ${update.sku}, found:`, inventoryItem);
        
        if (inventoryItem) {
          await updateStock(inventoryItem.productId, update.newStock, 'manual', 'Массовое обновление');
        } else {
          console.warn(`Product with SKU ${update.sku} not found in inventory`);
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
