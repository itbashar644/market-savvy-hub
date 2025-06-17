
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload } from 'lucide-react';
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
    return inventory
      .filter(item => item.wildberries_sku) // Только товары с Wildberries SKU
      .map(item => ({
        nm_id: parseInt(item.wildberries_sku!),
        warehouse_id: 1, // По умолчанию склад 1
        stock: item.currentStock,
        offer_id: item.sku, // Для Ozon
        sku: item.sku
      }));
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      const stockUpdates = getStockUpdatesFromInventory();
      
      if (stockUpdates.length === 0) {
        toast.warning('⚠️ Нет товаров с Wildberries SKU для обновления остатков');
        return;
      }

      if (marketplace === 'wildberries') {
        await updateWbStock(stockUpdates);
        toast.success('✅ Остатки Wildberries обновлены');
      } else {
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

  return (
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
            Обновите остатки товаров на маркетплейсах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={() => handleStockUpdate('wildberries')}
              disabled={syncing !== null}
              className="w-full"
              variant="outline"
            >
              <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
              {syncing === 'wildberries-stock' ? 'Обновление...' : 'Обновить остатки Wildberries'}
            </Button>
            
            <Button 
              onClick={() => handleStockUpdate('ozon')}
              disabled={syncing !== null}
              className="w-full"
              variant="outline"
            >
              <Upload className={`w-4 h-4 mr-2 ${syncing === 'ozon-stock' ? 'animate-spin' : ''}`} />
              {syncing === 'ozon-stock' ? 'Обновление...' : 'Обновить остатки Ozon'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualSyncControls;
