
import { supabase } from '@/integrations/supabase/client';
import { useWildberriesStockOperations } from './useWildberriesStockOperations';

export const useWildberriesStockBulkOperations = () => {
  const { addOrUpdateStockItem } = useWildberriesStockOperations();

  const bulkUpdateFromSkuMapping = async (skuMappings: Array<{ internal_sku: string; wildberries_sku: string }>) => {
    try {
      console.log('📦 [WildberriesStockBulkOperations] Массовое обновление SKU WB:', skuMappings.length);
      
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
          console.log(`📋 [WildberriesStockBulkOperations] Найден остаток для ${mapping.internal_sku}: ${currentStock}`);

          await addOrUpdateStockItem({
            internal_sku: mapping.internal_sku,
            wildberries_sku: mapping.wildberries_sku,
            stock_quantity: currentStock
          });
          results.success++;
        } catch (error) {
          console.error(`❌ [WildberriesStockBulkOperations] Ошибка обновления ${mapping.internal_sku}:`, error);
          results.failed++;
        }
      }
      
      console.log('📊 [WildberriesStockBulkOperations] Результаты массового обновления:', results);
      return results;
    } catch (error) {
      console.error('💥 [WildberriesStockBulkOperations] Критическая ошибка массового обновления:', error);
      throw error;
    }
  };

  return {
    bulkUpdateFromSkuMapping
  };
};
