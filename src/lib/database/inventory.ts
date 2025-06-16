
import { InventoryItem, InventoryHistory, Product } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { BaseDatabase } from './base';

export class InventoryDatabase extends BaseDatabase {
  async getInventory(): Promise<InventoryItem[]> {
    console.warn('InventoryDatabase.getInventory is deprecated. Use useInventory hook instead.');
    return [];
  }

  updateInventoryStock(productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string): InventoryItem | null {
    console.warn('InventoryDatabase.updateInventoryStock is deprecated. Use useInventory hook instead.');
    return null;
  }

  bulkUpdateInventoryStock(updates: { sku: string; newStock: number }[]): InventoryItem[] {
    console.warn('InventoryDatabase.bulkUpdateInventoryStock is deprecated. Use useInventory hook instead.');
    return [];
  }

  getInventoryHistory(): InventoryHistory[] {
    console.warn('InventoryDatabase.getInventoryHistory is deprecated. Use useInventoryHistory hook instead.');
    return [];
  }

  addInventoryHistory(historyRecord: Omit<InventoryHistory, 'id'>): InventoryHistory {
    console.warn('InventoryDatabase.addInventoryHistory is deprecated. Use useInventoryHistory hook instead.');
    return { ...historyRecord, id: '' };
  }

  updateInventoryFromProduct(product: Product): void {
    // This method can remain for backward compatibility but should log a warning
    console.warn('updateInventoryFromProduct is deprecated. Inventory should be managed through Supabase.');
  }

  deleteInventoryItem(productId: string): void {
    // This method can remain for backward compatibility but should log a warning
    console.warn('deleteInventoryItem is deprecated. Inventory should be managed through Supabase.');
  }
}
