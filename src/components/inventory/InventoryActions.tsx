
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, History } from 'lucide-react';
import { InventoryHistory } from '@/types/database';
import InventoryHistoryComponent from '../InventoryHistory';

interface InventoryActionsProps {
  history: InventoryHistory[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const InventoryActions = ({ history, showHistory, setShowHistory }: InventoryActionsProps) => {
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
      
      <Button variant="outline">
        <TrendingUp className="w-4 h-4 mr-2" />
        Пополнить
      </Button>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Добавить товар
      </Button>
    </div>
  );
};

export default InventoryActions;
