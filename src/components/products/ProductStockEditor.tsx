
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import { useInventory } from '@/hooks/useDatabase';

interface ProductStockEditorProps {
  productId: string;
  currentStock: number;
  minStock: number;
}

const ProductStockEditor = ({ productId, currentStock, minStock }: ProductStockEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(currentStock);
  const { updateStock } = useInventory();

  const handleSave = () => {
    updateStock(productId, newStock, 'manual', 'Ручное изменение остатка из карточки товара');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewStock(currentStock);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setNewStock(currentStock);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
          className="w-16 h-8 text-sm"
          min="0"
          autoFocus
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
        >
          <span className="text-xs">✓</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <span className="text-xs">✕</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium ${currentStock < minStock ? 'text-red-600' : 'text-green-600'}`}>
        {currentStock} шт.
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="h-6 w-6 p-0 hover:bg-gray-100"
        title="Редактировать остаток"
      >
        <Edit className="w-3 h-3 text-gray-500" />
      </Button>
    </div>
  );
};

export default ProductStockEditor;
