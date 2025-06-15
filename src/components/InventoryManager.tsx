
import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useInventory, useInventoryHistory } from '@/hooks/useDatabase';
import InventoryStats from './inventory/InventoryStats';
import InventoryActions from './inventory/InventoryActions';
import InventoryTable from './inventory/InventoryTable';
import { InventoryHistory, InventoryItem } from '@/types/database';

const InventoryManager = () => {
  const { inventory, loading, updateStock, bulkUpdateStock } = useInventory();
  const { history } = useInventoryHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [editingStock, setEditingStock] = useState<{ productId: string; newStock: number } | null>(null);

  const handleStockUpdate = (productId: string, newStock: number) => {
    updateStock(productId, newStock, 'manual', 'Ручное изменение остатка');
    setEditingStock(null);
  };
  
  const handleBulkStockUpdate = (updates: { sku: string; newStock: number }[]) => {
    bulkUpdateStock(updates);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка остатков...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление остатками</h1>
          <p className="text-gray-600 mt-1">Отслеживайте и управляйте складскими запасами</p>
        </div>
        <InventoryActions
          inventory={inventory}
          onStockUpdate={updateStock}
          onBulkStockUpdate={handleBulkStockUpdate}
          history={history}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
      </div>

      <InventoryStats inventory={inventory} />

      <InventoryTable
        inventory={inventory}
        history={history}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        editingStock={editingStock}
        setEditingStock={setEditingStock}
        onStockUpdate={handleStockUpdate}
      />
    </div>
  );
};

export default InventoryManager;
