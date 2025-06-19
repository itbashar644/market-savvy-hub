
import { useWildberriesStockData } from './wildberries-stock/useWildberriesStockData';
import { useWildberriesStockOperations } from './wildberries-stock/useWildberriesStockOperations';
import { useWildberriesStockBulkOperations } from './wildberries-stock/useWildberriesStockBulkOperations';

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
  const { stockItems, loading, refreshStockItems } = useWildberriesStockData();
  const { addOrUpdateStockItem, updateStockQuantity, deleteStockItem } = useWildberriesStockOperations();
  const { bulkUpdateFromSkuMapping } = useWildberriesStockBulkOperations();

  return {
    stockItems,
    loading,
    addOrUpdateStockItem,
    bulkUpdateFromSkuMapping,
    updateStockQuantity,
    deleteStockItem,
    refreshStockItems
  };
};
