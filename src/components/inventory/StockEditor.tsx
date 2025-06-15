
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';

interface StockEditorProps {
  itemId: string;
  currentStock: number;
  minStock: number;
  editingStock: { id: string; newStock: number } | null;
  setEditingStock: (editing: { id: string; newStock: number } | null) => void;
  onStockUpdate: (productId: string, newStock: number) => void;
}

const StockEditor = ({ 
  itemId, 
  currentStock, 
  minStock, 
  editingStock, 
  setEditingStock, 
  onStockUpdate 
}: StockEditorProps) => {
  if (editingStock?.id === itemId) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editingStock.newStock}
          onChange={(e) => setEditingStock({ 
            id: itemId, 
            newStock: parseInt(e.target.value) || 0 
          })}
          className="w-20"
        />
        <Button 
          size="sm" 
          onClick={() => onStockUpdate(itemId, editingStock.newStock)}
        >
          ✓
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setEditingStock(null)}
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium ${
        currentStock <= minStock ? 'text-red-600' : 'text-gray-900'
      }`}>
        {currentStock}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setEditingStock({ id: itemId, newStock: currentStock })}
      >
        <Edit className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default StockEditor;
