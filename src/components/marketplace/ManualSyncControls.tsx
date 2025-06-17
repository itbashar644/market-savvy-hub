
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useOzonSync } from '@/hooks/database/useOzonSync';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';
import { useOzonStockUpdate } from '@/hooks/database/useOzonStockUpdate';
import { useInventory } from '@/hooks/database/useInventory';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { inventory } = useInventory();

  const handleWildberriesSync = async () => {
    setSyncing('wildberries-sync');
    try {
      await syncWbProducts();
      toast.success('✅ Синхронизация Wildberries завершена');
    } catch (error) {
      console.error('Wildberries sync error:', error);
      toast.error('❌ Ошибка синхронизации Wildberries: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSyncing(null);
    }
  };

  const handleOzonSync = async () => {
    setSyncing('ozon-sync');
    try {
      await syncOzonProducts();
      toast.success('✅ Синхронизация Ozon завершена');
    } catch (error) {
      console.error('Ozon sync error:', error);
      toast.error('❌ Ошибка синхронизации Ozon: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSyncing(null);
    }
  };

  const getStockUpdatesFromInventory = () => {
    console.log('Проверяем товары в инвентаре:', inventory);
    
    const itemsWithWbSku = inventory.filter(item => {
      const hasWbSku = item.wildberries_sku && item.wildberries_sku.trim() !== '';
      console.log(`Товар ${item.sku}: WB SKU = ${item.wildberries_sku}, есть ли WB SKU: ${hasWbSku}`);
      return hasWbSku;
    });

    console.log('Товары с Wildberries SKU:', itemsWithWbSku);

    return itemsWithWbSku.map(item => ({
      nm_id: parseInt(item.wildberries_sku!),
      warehouse_id: 1,
      stock: item.current_stock,
      offer_id: item.sku,
      sku: item.sku
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
        toast.success('✅ Остатки Wildberries обновлены');
      } else {
        console.log('Отправляем обновление остатков на Ozon:', stockUpdates);
        await updateOzonStock(stockUpdates);
        toast.success('✅ Остатки Ozon обновлены');
      }
    } catch (error) {
      console.error(`${marketplace} stock update error:`, error);
      toast.error(`❌ Ошибка обновления остатков ${marketplace}: ` + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSyncing(null);
    }
  };

  const totalItems = inventory.length;
  const itemsWithWbSku = inventory.filter(item => item.wildberries_sku && item.wildberries_sku.trim() !== '').length;

  return (
    <div className="space-y-6">
      {/* Statistics panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Статистика товаров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Всего товаров</div>
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">С Wildberries SKU</div>
              <div className="text-2xl font-bold text-green-600">{itemsWithWbSku}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-800">Без SKU</div>
              <div className="text-2xl font-bold text-orange-600">{totalItems - itemsWithWbSku}</div>
            </div>
          </div>
          {itemsWithWbSku === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Для обновления остатков необходимо добавить Wildberries SKU к товарам. 
                Перейдите в раздел "Товары" и воспользуйтесь функцией импорта SKU.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Ручная синхронизация
            </CardTitle>
            <CardDescription>
              Запустите синхронизацию товаров с маркетплейсами вручную
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleWildberriesSync}
                disabled={syncing !== null}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing === 'wildberries-sync' ? 'animate-spin' : ''}`} />
                {syncing === 'wildberries-sync' ? 'Синхронизация...' : 'Синхронизировать Wildberries'}
              </Button>
              
              <Button 
                onClick={handleOzonSync}
                disabled={syncing !== null}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing === 'ozon-sync' ? 'animate-spin' : ''}`} />
                {syncing === 'ozon-sync' ? 'Синхронизация...' : 'Синхронизировать Ozon'}
              </Button>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default ManualSyncControls;
