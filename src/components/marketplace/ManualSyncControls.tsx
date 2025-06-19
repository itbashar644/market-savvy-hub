
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
import { useProducts } from '@/hooks/database/useProducts';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { inventory } = useInventory();
  const { products } = useProducts();

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
    console.log('🔍 ПОДГОТОВКА ДАННЫХ ДЛЯ ОБНОВЛЕНИЯ ОСТАТКОВ WB');
    console.log('📦 Общее количество товаров в products:', products.length);
    console.log('📦 Общее количество товаров в inventory:', inventory.length);
    
    // Используем данные из products напрямую, они более актуальные
    const itemsWithWbSku = products.filter(product => {
      const hasWbSku = product.wildberriesSku && product.wildberriesSku.trim() !== '';
      console.log(`📦 Товар ${product.sku || product.id}: WB SKU = "${product.wildberriesSku || 'НЕТ'}", остаток: ${product.stock || 0}`);
      return hasWbSku;
    });

    console.log(`✅ Товары с актуальными Wildberries SKU: ${itemsWithWbSku.length} из ${products.length}`);

    const stockUpdates = itemsWithWbSku.map(product => {
      const wbSku = product.wildberriesSku!;
      const numericWbSku = parseInt(wbSku);
      
      if (isNaN(numericWbSku)) {
        console.warn(`⚠️ Неверный формат WB SKU для товара ${product.sku}: ${wbSku}`);
        return null;
      }
      
      const stockData = {
        offer_id: numericWbSku.toString(),
        stock: product.stock || 0,
        sku: product.sku || product.id,
        name: product.name || product.title || 'Без названия'
      };
      
      console.log(`📤 Подготовлен для отправки: ${product.sku} -> WB SKU: ${stockData.offer_id}, остаток: ${stockData.stock}`);
      
      return stockData;
    }).filter(Boolean);

    console.log(`🎯 ИТОГО подготовлено для WB API: ${stockUpdates.length} товаров`);
    return stockUpdates;
  };

  const getOzonStockUpdates = () => {
    return products.filter(product => product.wildberriesSku && product.wildberriesSku.trim() !== '')
      .map(product => ({
        offer_id: product.sku || product.id,
        stock: product.stock || 0,
        sku: product.sku || product.id,
        name: product.name || product.title || 'Без названия'
      }));
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      console.log(`🚀 Начинаем обновление остатков для: ${marketplace}`);
      
      let stockUpdates;
      if (marketplace === 'wildberries') {
        stockUpdates = getWildberriesStockUpdates();
      } else {
        stockUpdates = getOzonStockUpdates();
      }
      
      console.log(`📊 Подготовленные данные для ${marketplace}:`, stockUpdates);

      if (stockUpdates.length === 0) {
        const totalItems = products.length;
        const itemsWithoutWbSku = products.filter(p => !p.wildberriesSku || p.wildberriesSku.trim() === '');
        
        toast.warning(`⚠️ Нет товаров с ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'} SKU для обновления остатков`, {
          description: `Всего товаров: ${totalItems}, без SKU: ${itemsWithoutWbSku.length}. Сначала обновите SKU в разделе "Товары".`
        });
        return;
      }

      if (marketplace === 'wildberries') {
        console.log(`📤 Отправляем ${stockUpdates.length} товаров на обновление остатков в Wildberries...`);
        await updateWbStock(stockUpdates);
        toast.success('✅ Остатки Wildberries обновлены');
      } else {
        console.log(`📤 Отправляем ${stockUpdates.length} товаров на обновление остатков в Ozon...`);
        await updateOzonStock(stockUpdates);
        toast.success('✅ Остатки Ozon обновлены');
      }
    } catch (error) {
      console.error(`💥 ${marketplace} stock update error:`, error);
      toast.error(`❌ Ошибка обновления остатков ${marketplace}: ` + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSyncing(null);
    }
  };

  const totalItems = products.length;
  const itemsWithWbSku = products.filter(p => p.wildberriesSku && p.wildberriesSku.trim() !== '').length;

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
                Перейдите в раздел "Товары" → вкладка "Импорт SKU WB" и воспользуйтесь функцией импорта SKU.
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
