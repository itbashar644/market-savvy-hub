
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import { useProducts } from '@/hooks/useDatabase';

interface ProductStockEditorProps {
  productId: string;
  currentStock: number;
  minStock: number;
}

const ProductStockEditor = ({ productId, currentStock, minStock }: ProductStockEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(currentStock);
  const { updateProduct } = useProducts();

  const handleSave = async () => {
    console.log('Сохраняем новый остаток:', newStock, 'для продукта:', productId);
    
    // Определяем новый статус на основе остатка
    let newStatus: 'active' | 'low_stock' | 'out_of_stock' = 'active';
    if (newStock <= 0) {
      newStatus = 'out_of_stock';
    } else if (newStock <= minStock) { // Используем minStock
      newStatus = 'low_stock';
    }

    try {
      // Обновляем продукт с новым остатком и статусом
      updateProduct(productId, { 
        stock: newStock,
        status: newStatus
      });
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Ошибка при обновлении остатка:', error);
    }
  };

  const handleCancel = () => {
    setNewStock(currentStock);
    setIsEditing(false);
  };

  const handleEdit = () => {
    console.log('Начинаем редактирование остатка для продукта:', productId);
    setNewStock(currentStock);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={newStock}
          onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
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

  const getStockColor = () => {
    if (currentStock <= 0) return 'text-red-600';
    if (currentStock <= minStock) return 'text-yellow-600'; // Используем minStock
    return 'text-green-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium ${getStockColor()}`}>
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
