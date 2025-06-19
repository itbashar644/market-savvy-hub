
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useOzonSync } from '@/hooks/database/useOzonSync';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';
import { useOzonStockUpdate } from '@/hooks/database/useOzonStockUpdate';
import { useWildberriesStock } from '@/hooks/database/useWildberriesStock';
import { WildberriesStockStatistics } from './components/WildberriesStockStatistics';
import { ManualSyncButtons } from './components/ManualSyncButtons';
import { StockUpdateButtons } from './components/StockUpdateButtons';

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
            const wbSku = String(item.wildberries_sku).trim();

      if (!/^\d+$/.test(wbSku)) {
        console.warn(`⚠️ [STOCK UPDATE] Неверный формат WB SKU: ${item.wildberries_sku}`);
        return null;
      }
      
      const stockData = {
        offer_id: wbSku,
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
      <WildberriesStockStatistics 
        totalWbItems={totalWbItems}
        itemsWithStock={itemsWithStock}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManualSyncButtons
          syncing={syncing}
          onWildberriesSync={handleWildberriesSync}
          onOzonSync={handleOzonSync}
        />

        <StockUpdateButtons
          syncing={syncing}
          totalWbItems={totalWbItems}
          onStockUpdate={handleStockUpdate}
        />
      </div>
    </div>
  );
};

export default ManualSyncControls;
