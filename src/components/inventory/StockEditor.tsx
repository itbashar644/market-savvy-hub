
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import { InventoryItem } from '@/types/database';

interface StockEditorProps {
  productId: string;
  currentStock: number;
  status: InventoryItem['status'];
  editingStock: { productId: string; newStock: number } | null;
  setEditingStock: (editing: { productId: string; newStock: number } | null) => void;
  onStockUpdate: (productId: string, newStock: number) => void;
}

const StockEditor = ({ 
  productId, 
  currentStock, 
  status,
  editingStock, 
  setEditingStock, 
  onStockUpdate 
}: StockEditorProps) => {
  const handleSave = () => {
    if (editingStock) {
      onStockUpdate(productId, editingStock.newStock);
    }
  };

  const handleCancel = () => {
    setEditingStock(null);
  };

  const handleEdit = () => {
    console.log('Нажата кнопка редактирования для товара:', productId);
    setEditingStock({ productId: productId, newStock: currentStock });
  };

  if (editingStock?.productId === productId) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editingStock.newStock}
          onChange={(e) => setEditingStock({ 
            productId: productId, 
            newStock: parseInt(e.target.value) || 0 
          })}
          className="w-20"
          min="0"
          autoFocus
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          className="px-2 bg-green-600 hover:bg-green-700"
        >
          ✓
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel}
          className="px-2"
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium ${
        (status === 'out_of_stock' || status === 'low_stock') ? 'text-red-600' : 'text-gray-900'
      }`}>
        {currentStock}
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={handleEdit}
        className="h-8 w-8 p-1 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
        title="Редактировать остаток"
      >
        <Edit className="w-4 h-4 text-gray-600" />
      </Button>
    </div>
  );
};

export default StockEditor;
