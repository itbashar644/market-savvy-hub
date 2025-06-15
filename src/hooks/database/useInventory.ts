
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { InventoryItem, InventoryHistory } from '@/types/database';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInventory = () => {
    setInventory(db.getInventory());
    setLoading(false);
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const updateStock = (productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string) => {
    const updated = db.updateInventoryStock(productId, newStock, changeType, reason);
    refreshInventory();
    return updated;
  };

  const bulkUpdateStock = (updates: { sku: string; newStock: number }[]) => {
    db.bulkUpdateInventoryStock(updates);
    refreshInventory();
  };

  return {
    inventory,
    loading,
    updateStock,
    bulkUpdateStock,
    refreshInventory,
  };
};
