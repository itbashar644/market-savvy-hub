
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, History, Edit } from 'lucide-react';
import { InventoryHistory, InventoryItem } from '@/types/database';
import InventoryHistoryComponent from '../InventoryHistory';
import RestockForm from './RestockForm';
import BulkStockEditor from './BulkStockEditor';

interface InventoryActionsProps {
  inventory: InventoryItem[];
  history: InventoryHistory[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  onStockUpdate: (productId: string, newStock: number, changeType: InventoryHistory['changeType'], reason?: string) => void;
  onBulkStockUpdate: (updates: { sku: string; newStock: number }[]) => void;
}

const InventoryActions = ({ 
  inventory, 
  history, 
  showHistory, 
  setShowHistory, 
  onStockUpdate, 
  onBulkStockUpdate 
}: InventoryActionsProps) => {
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);

  const handleRestock = (productId: string, currentStock: number, quantityToAdd: number) => {
    const newStock = currentStock + quantityToAdd;
    onStockUpdate(productId, newStock, 'restock', 'Пополнение склада');
  };

  return (
    <div className="flex gap-2">
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            История изменений
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История изменений остатков</DialogTitle>
            <DialogDescription>
              Все изменения складских запасов с указанием времени и причины
            </DialogDescription>
          </DialogHeader>
          <InventoryHistoryComponent history={history} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Пополнить
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Пополнение остатков</DialogTitle>
            <DialogDescription>
              Выберите товар и укажите количество для пополнения.
            </DialogDescription>
          </DialogHeader>
          <RestockForm
            inventory={inventory}
            onRestock={handleRestock}
            onClose={() => setIsRestockDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Массовое редактирование
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Массовое редактирование остатков</DialogTitle>
            <DialogDescription>
              Обновите остатки для нескольких товаров одновременно, используя формат SKU - Остаток.
            </DialogDescription>
          </DialogHeader>
          <BulkStockEditor
            inventory={inventory}
            onBulkUpdate={onBulkStockUpdate}
            onClose={() => setIsBulkEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Добавить товар
      </Button>
    </div>
  );
};

export default InventoryActions;
