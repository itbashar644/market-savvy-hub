
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useOzonSync } from '@/hooks/database/useOzonSync';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';
import { useOzonStockUpdate } from '@/hooks/database/useOzonStockUpdate';
import { useWildberriesStock } from '@/hooks/database/useWildberriesStock';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { stockItems, loading: stockLoading } = useWildberriesStock();

  console.log('🔍 [ManualSyncControls] Остатки WB из новой таблицы:', stockItems.length);
  console.log('🔍 [ManualSyncControls] Загрузка остатков WB:', stockLoading);
  console.log('🔍 [ManualSyncControls] Первые 5 остатков WB:', stockItems.slice(0, 5).map(item => ({
    internal_sku: item.internal_sku,
    wildberries_sku: item.wildberries_sku,
    stock_quantity: item.stock_quantity
  })));

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

  const getWildberriesStockUpdates = () => {
    console.log('🔍 [STOCK UPDATE] ПОДГОТОВКА ДАННЫХ ИЗ НОВОЙ ТАБЛИЦЫ WB');
    console.log('📦 [STOCK UPDATE] Остатков WB в таблице:', stockItems.length);
    
    if (stockItems.length === 0) {
      console.log('❌ [STOCK UPDATE] НЕТ ОСТАТКОВ WB В ТАБЛИЦЕ!');
      return [];
    }
    
    const stockUpdates = stockItems.map((item, index) => {
      const numericWbSku = parseInt(item.wildberries_sku);
      
      if (isNaN(numericWbSku)) {
        console.warn(`⚠️ [STOCK UPDATE] Неверный формат WB SKU: ${item.wildberries_sku}`);
        return null;
      }
      
      const stockData = {
        offer_id: numericWbSku.toString(),
        stock: item.stock_quantity,
        sku: item.internal_sku,
        name: `Товар ${item.internal_sku}`
      };
      
      console.log(`📤 [STOCK UPDATE] Подготовлен: "${item.internal_sku}" -> WB SKU: ${stockData.offer_id}, остаток: ${stockData.stock}`);
      
      return stockData;
    }).filter(Boolean);

    console.log(`🎯 [STOCK UPDATE] ИТОГО подготовлено для WB API: ${stockUpdates.length} товаров`);
    return stockUpdates;
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      console.log(`🚀 [STOCK UPDATE] Начинаем обновление остатков для: ${marketplace}`);
      console.log(`📊 [STOCK UPDATE] Всего остатков WB в таблице: ${stockItems.length}`);
      
      if (stockItems.length === 0) {
        toast.error('❌ В таблице остатков WB нет данных!', {
          description: 'Сначала импортируйте SKU через раздел "Товары" → "Импорт SKU WB".'
        });
        return;
      }
      
      let stockUpdates;
      if (marketplace === 'wildberries') {
        stockUpdates = getWildberriesStockUpdates();
      } else {
        // Для Ozon пока используем пустой массив
        stockUpdates = [];
      }
      
      console.log(`📊 [STOCK UPDATE] Подготовленные данные для ${marketplace}:`, stockUpdates.slice(0, 3));

      if (stockUpdates.length === 0) {
        toast.warning(`⚠️ Нет данных для обновления остатков ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'}`, {
          description: `Всего остатков WB: ${stockItems.length}. Проверьте корректность данных в таблице.`
        });
        return;
      }

      if (marketplace === 'wildberries') {
        console.log(`📤 [STOCK UPDATE] Отправляем ${stockUpdates.length} товаров на обновление остатков в Wildberries...`);
        await updateWbStock(stockUpdates);
        toast.success('✅ Остатки Wildberries обновлены');
      } else {
        console.log(`📤 [STOCK UPDATE] Отправляем ${stockUpdates.length} товаров на обновление остатков в Ozon...`);
        await updateOzonStock(stockUpdates);
        toast.success('✅ Остатки Ozon обновлены');
      }
    } catch (error) {
      console.error(`💥 [STOCK UPDATE] ${marketplace} stock update error:`, error);
      toast.error(`❌ Ошибка обновления остатков ${marketplace}: ` + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSyncing(null);
    }
  };

  // Показываем загрузку, если остатки WB еще загружаются
  if (stockLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Загрузка остатков Wildberries из базы данных...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalWbItems = stockItems.length;
  const itemsWithStock = stockItems.filter(item => item.stock_quantity > 0).length;

  return (
    <div className="space-y-6">
      {/* Statistics panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Статистика остатков Wildberries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Всего SKU WB</div>
              <div className="text-2xl font-bold text-blue-600">{totalWbItems}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">С остатком &gt; 0</div>
              <div className="text-2xl font-bold text-green-600">{itemsWithStock}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-800">Без остатка</div>
              <div className="text-2xl font-bold text-orange-600">{totalWbItems - itemsWithStock}</div>
            </div>
          </div>
          {totalWbItems === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>В таблице остатков WB нет данных!</strong> Импортируйте SKU через раздел "Товары" → "Импорт SKU WB".
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
              Обновите остатки на маркетплейсах ({totalWbItems} SKU WB готово)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={() => handleStockUpdate('wildberries')}
                disabled={syncing !== null || totalWbItems === 0}
                className="w-full"
                variant="outline"
              >
                <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
                {syncing === 'wildberries-stock' ? 'Обновление...' : `Обновить остатки Wildberries (${totalWbItems})`}
              </Button>
              
              <Button 
                onClick={() => handleStockUpdate('ozon')}
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
      </div>
    </div>
  );
};

export default ManualSyncControls;
