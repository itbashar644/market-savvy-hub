import { InventoryItem, InventoryHistory, Product } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { BaseDatabase } from './base';

export class InventoryDatabase extends BaseDatabase {
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching inventory from Supabase:', error);
        return this.getFromStorage<InventoryItem>('inventory');
      }

      // Transform Supabase data to match our InventoryItem type
      return data.map(item => ({
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
    } catch (error) {
      console.error('Error in getInventory:', error);
      return this.getFromStorage<InventoryItem>('inventory');
    }
  }

  updateInventoryStock(productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string): InventoryItem | null {
    console.warn('updateInventoryStock is deprecated. Use useInventory hook instead.');
    const inventory = this.getFromStorage<InventoryItem>('inventory');
    const index = inventory.findIndex(i => i.productId === productId);
    if (index === -1) return null;

    const item = inventory[index];
    const previousStock = item.currentStock;
    const changeAmount = newStock - previousStock;

    this.addInventoryHistory({
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      previousStock,
      newStock,
      changeAmount,
      changeType,
      reason,
      userName: 'Администратор',
      timestamp: new Date().toISOString(),
    });

    item.currentStock = newStock;
    item.status = newStock <= 0 ? 'out_of_stock' 
                : newStock <= item.minStock ? 'low_stock' 
                : 'in_stock';
    item.lastRestocked = new Date().toISOString();
    
    this.saveToStorage('inventory', inventory);

    const products = this.getFromStorage<Product>('products');
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      const product = products[productIndex];
      product.stock = newStock;
      product.status = newStock <= 0 ? 'out_of_stock'
                                    : newStock <= product.minStock ? 'low_stock'
                                    : 'active';
      this.saveToStorage('products', products);
    }

    return item;
  }

  bulkUpdateInventoryStock(updates: { sku: string; newStock: number }[]): InventoryItem[] {
    console.warn('bulkUpdateInventoryStock is deprecated. Use useInventory hook instead.');
    const inventory = this.getFromStorage<InventoryItem>('inventory');
    const products = this.getFromStorage<Product>('products');
    const updatedItems: InventoryItem[] = [];

    updates.forEach(({ sku, newStock }) => {
        const index = inventory.findIndex(i => i.sku === sku);
        if (index !== -1) {
            const item = inventory[index];
            const previousStock = item.currentStock;
            
            if (previousStock !== newStock) {
                const changeAmount = newStock - previousStock;
                this.addInventoryHistory({
                  productId: item.productId,
                  productName: item.name,
                  sku: item.sku,
                  previousStock,
                  newStock,
                  changeAmount,
                  changeType: 'manual',
                  reason: 'Массовое обновление',
                  userName: 'Администратор',
                  timestamp: new Date().toISOString(),
                });

                item.currentStock = newStock;
                item.status = newStock <= 0 ? 'out_of_stock'
                            : newStock <= item.minStock ? 'low_stock'
                            : 'in_stock';
                item.lastRestocked = new Date().toISOString();
                updatedItems.push(item);

                const productIndex = products.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    products[productIndex].stock = newStock;
                    products[productIndex].status = newStock <= 0 ? 'out_of_stock'
                                                  : newStock <= products[productIndex].minStock ? 'low_stock'
                                                  : 'active';
                }
            }
        }
    });

    this.saveToStorage('inventory', inventory);
    this.saveToStorage('products', products);
    return updatedItems;
  }

  getInventoryHistory(): InventoryHistory[] {
    return this.getFromStorage<InventoryHistory>('inventory_history').sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addInventoryHistory(historyRecord: Omit<InventoryHistory, 'id'>): InventoryHistory {
    const history = this.getInventoryHistory();
    const newRecord: InventoryHistory = {
      ...historyRecord,
      id: this.generateId(),
    };
    history.push(newRecord);
    this.saveToStorage('inventory_history', history);
    return newRecord;
  }

  updateInventoryFromProduct(product: Product): void {
    const inventory = this.getFromStorage<InventoryItem>('inventory');
    const index = inventory.findIndex(i => i.productId === product.id);
    
    let inventoryStatus: InventoryItem['status'];
    switch (product.status) {
      case 'active':
        inventoryStatus = 'in_stock';
        break;
      case 'low_stock':
        inventoryStatus = 'low_stock';
        break;
      case 'out_of_stock':
        inventoryStatus = 'out_of_stock';
        break;
      default:
        inventoryStatus = product.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    const inventoryItem: InventoryItem = {
      id: index >= 0 ? inventory[index].id : this.generateId(),
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentStock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      price: product.price,
      supplier: product.supplier,
      lastRestocked: index >= 0 ? inventory[index].lastRestocked : new Date().toISOString(),
      status: inventoryStatus,
    };

    if (index >= 0) {
      inventory[index] = inventoryItem;
    } else {
      inventory.push(inventoryItem);
    }
    
    this.saveToStorage('inventory', inventory);
  }

  deleteInventoryItem(productId: string): void {
    const inventory = this.getFromStorage<InventoryItem>('inventory');
    const filtered = inventory.filter(i => i.productId !== productId);
    this.saveToStorage('inventory', filtered);
  }
}
