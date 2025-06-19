
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface StockUpdateButtonsProps {
  syncing: string | null;
  totalWbItems: number;
  onStockUpdate: (marketplace: 'wildberries' | 'ozon') => void;
}

export const StockUpdateButtons: React.FC<StockUpdateButtonsProps> = ({
  syncing,
  totalWbItems,
  onStockUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Обновление остатков
        </CardTitle>
        <CardDescription>
          Обновите остатки на маркетплейсах ({totalWbItems} SKU WB готово)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button 
            onClick={() => onStockUpdate('wildberries')}
            disabled={syncing !== null || totalWbItems === 0}
            className="w-full"
            variant="outline"
          >
            <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
            {syncing === 'wildberries-stock' ? 'Обновление...' : `Обновить остатки Wildberries (${totalWbItems})`}
          </Button>
          
          <Button 
            onClick={() => onStockUpdate('ozon')}
            disabled={syncing !== null || totalWbItems === 0}
            className="w-full"
            variant="outline"
          >
            <Upload className={`w-4 h-4 mr-2 ${syncing === 'ozon-stock' ? 'animate-spin' : ''}`} />
            {syncing === 'ozon-stock' ? 'Обновление...' : `Обновить остатки Ozon (0)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
