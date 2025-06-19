
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

export const useWildberriesStockOperations = () => {
  const addOrUpdateStockItem = async (data: {
    product_id?: string;
    internal_sku: string;
    wildberries_sku: string;
    stock_quantity: number;
  }) => {
    try {
      console.log('🔄 [WildberriesStockOperations] Добавляем/обновляем остаток WB:', data);
      
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
        console.log('✅ [WildberriesStockOperations] Остаток WB обновлен:', existing.id);
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
        console.log('✅ [WildberriesStockOperations] Новый остаток WB добавлен');
      }

      return true;
    } catch (error) {
      console.error('❌ [WildberriesStockOperations] Ошибка добавления/обновления остатка WB:', error);
      toast.error('Ошибка сохранения остатка Wildberries');
      return false;
    }
  };

  const updateStockQuantity = async (id: string, newQuantity: number) => {
    try {
      console.log(`🔄 [WildberriesStockOperations] Обновляем количество для ${id}:`, newQuantity);
      
      const { error } = await supabase
        .from('wildberries_stock')
        .update({
          stock_quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      console.log('✅ [WildberriesStockOperations] Количество обновлено');
      return true;
    } catch (error) {
      console.error('❌ [WildberriesStockOperations] Ошибка обновления количества:', error);
      toast.error('Ошибка обновления количества');
      return false;
    }
  };

  const deleteStockItem = async (id: string) => {
    try {
      console.log(`🗑️ [WildberriesStockOperations] Удаляем остаток WB ${id}...`);
      const { error } = await supabase
        .from('wildberries_stock')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Остаток Wildberries удален');
      return true;
    } catch (error) {
      console.error('❌ [WildberriesStockOperations] Ошибка удаления остатка WB:', error);
      toast.error('Ошибка удаления остатка Wildberries');
      return false;
    }
  };

  return {
    addOrUpdateStockItem,
    updateStockQuantity,
    deleteStockItem
  };
};
