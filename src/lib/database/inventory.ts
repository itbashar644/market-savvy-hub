
import { InventoryItem, InventoryHistory, Product } from '@/types/database';
import { BaseDatabase } from './base';

export class InventoryDatabase extends BaseDatabase {
  getInventory(): InventoryItem[] {
    return this.getFromStorage<InventoryItem>('inventory');
  }

  updateInventoryStock(productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string): InventoryItem | null {
    const inventory = this.getInventory();
    const index = inventory.findIndex(i => i.productId === productId);
    if (index === -1) return null;

    const item = inventory[index];
    const previousStock = item.currentStock;
    const changeAmount = newStock - previousStock;

    // Записываем историю изменения
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
                : newStock <= 10 ? 'low_stock' 
                : 'in_stock';
    item.lastRestocked = new Date().toISOString();
    
    this.saveToStorage('inventory', inventory);
    return item;
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
    const inventory = this.getInventory();
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
    const inventory = this.getInventory();
    const filtered = inventory.filter(i => i.productId !== productId);
    this.saveToStorage('inventory', filtered);
  }
}
