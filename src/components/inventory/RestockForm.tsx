
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/types/database';
import { Label } from '@/components/ui/label';

interface RestockFormProps {
  inventory: InventoryItem[];
  onRestock: (productId: string, currentStock: number, quantityToAdd: number) => void;
  onClose: () => void;
}

const RestockForm = ({ inventory, onRestock, onClose }: RestockFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);

  const handleSubmit = () => {
    if (!selectedProductId || quantity <= 0) {
      return;
    }
    const item = inventory.find(i => i.productId === selectedProductId);
    if (!item) return;

    onRestock(selectedProductId, item.currentStock, quantity);
    onClose();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="product">Товар</Label>
        <Select onValueChange={setSelectedProductId} value={selectedProductId}>
          <SelectTrigger id="product">
            <SelectValue placeholder="Выберите товар для пополнения" />
          </SelectTrigger>
          <SelectContent>
            {inventory.map((item) => (
              <SelectItem key={item.id} value={item.productId}>
                {item.name} (Текущий остаток: {item.currentStock})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Количество</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          min="1"
          placeholder="Введите количество"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedProductId || quantity <= 0}>
          Пополнить
        </Button>
      </div>
    </div>
  );
};

export default RestockForm;
