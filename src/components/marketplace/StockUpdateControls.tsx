
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';
import { useOzonStockUpdate } from '@/hooks/database/useOzonStockUpdate';
import { useInventory } from '@/hooks/database/useInventory';

const StockUpdateControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { inventory } = useInventory();

  const getStockUpdatesFromInventory = () => {
    console.log('Проверяем товары в инвентаре:', inventory);
    
    const itemsWithWbSku = inventory.filter(item => {
      const hasWbSku = item.wildberries_sku && item.wildberries_sku.trim() !== '';
      console.log(`Товар ${item.sku}: WB SKU = ${item.wildberries_sku}, есть ли WB SKU: ${hasWbSku}`);
      return hasWbSku;
    });

    console.log('Товары с Wildberries SKU:', itemsWithWbSku);

    return itemsWithWbSku.map(item => ({
      nm_id: item.wildberries_sku!, // Keep as string
      warehouse_id: 1,
      stock: item.currentStock,
      offer_id: item.sku,
      sku: item.sku,
      name: item.name,
      category: item.category
    }));
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      console.log('Начинаем обновление остатков для:', marketplace);
      const stockUpdates = getStockUpdatesFromInventory();
      
      console.log('Подготовленные данные для обновления:', stockUpdates);

      if (stockUpdates.length === 0) {
        const totalItems = inventory.length;
        const itemsWithoutWbSku = inventory.filter(item => !item.wildberries_sku || item.wildberries_sku.trim() === '');
        
        toast.warning('⚠️ Нет товаров с Wildberries SKU для обновления остатков', {
          description: `Всего товаров: ${totalItems}, без WB SKU: ${itemsWithoutWbSku.length}. Сначала добавьте Wildberries SKU в разделе "Товары".`
        });
        return;
      }

      if (marketplace === 'wildberries') {
        console.log('Отправляем обновление остатков на Wildberries:', stockUpdates);
        await updateWbStock(stockUpdates);
      } else {
        console.log('Отправляем обновление остатков на Ozon:', stockUpdates);
        await updateOzonStock(stockUpdates);
      }
    } catch (error) {
      console.error(`${marketplace} stock update error:`, error);
      // Ошибки уже обрабатываются в хуках
    } finally {
      setSyncing(null);
    }
  };

  const totalItems = inventory.length;
  const itemsWithWbSku = inventory.filter(item => item.wildberries_sku && item.wildberries_sku.trim() !== '').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Обновление остатков
        </CardTitle>
        <CardDescription>
          Обновите остатки товаров на маркетплейсах ({itemsWithWbSku} товаров готово)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {itemsWithWbSku === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Для обновления остатков необходимо добавить Wildberries SKU к товарам. 
                Перейдите в раздел "Товары" и воспользуйтесь функцией импорта SKU.
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={() => handleStockUpdate('wildberries')}
            disabled={syncing !== null || itemsWithWbSku === 0}
            className="w-full"
            variant="outline"
          >
            <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
            {syncing === 'wildberries-stock' ? 'Обновление...' : `Обновить остатки Wildberries (${itemsWithWbSku})`}
          </Button>
          
          <Button 
            onClick={() => handleStockUpdate('ozon')}
            disabled={syncing !== null || itemsWithWbSku === 0}
            className="w-full"
            variant="outline"
          >
            <Upload className={`w-4 h-4 mr-2 ${syncing === 'ozon-stock' ? 'animate-spin' : ''}`} />
            {syncing === 'ozon-stock' ? 'Обновление...' : `Обновить остатки Ozon (${itemsWithWbSku})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockUpdateControls;
