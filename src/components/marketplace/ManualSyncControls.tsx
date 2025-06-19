
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useOzonSync } from '@/hooks/database/useOzonSync';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';
import { useOzonStockUpdate } from '@/hooks/database/useOzonStockUpdate';
import { useProducts } from '@/hooks/database/useProducts';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();
  const { updateStock: updateOzonStock } = useOzonStockUpdate();
  const { products, loading: productsLoading } = useProducts();

  console.log('🔍 [ManualSyncControls] Товары из Supabase:', products.length);
  console.log('🔍 [ManualSyncControls] Загрузка:', productsLoading);
  console.log('🔍 [ManualSyncControls] Первые 5 товаров:', products.slice(0, 5).map(p => ({
    id: p.id,
    title: p.title?.substring(0, 30) + '...',
    sku: p.sku || p.articleNumber,
    wbSku: p.wildberriesSku
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
    console.log('🔍 [STOCK UPDATE] ПОДГОТОВКА ДАННЫХ ДЛЯ ОБНОВЛЕНИЯ ОСТАТКОВ WB');
    console.log('📦 [STOCK UPDATE] Товары из Supabase:', products.length);
    
    if (products.length === 0) {
      console.log('❌ [STOCK UPDATE] НЕТ ТОВАРОВ В БАЗЕ SUPABASE!');
      return [];
    }
    
    const itemsWithWbSku = products.filter(product => {
      const hasWbSku = product.wildberriesSku && product.wildberriesSku.trim() !== '';
      console.log(`📦 [STOCK UPDATE] Товар "${product.title?.substring(0, 30)}...": WB SKU = "${product.wildberriesSku || 'НЕТ'}", остаток: ${product.stock || product.stockQuantity || 0}`);
      return hasWbSku;
    });

    console.log(`✅ [STOCK UPDATE] Товары с Wildberries SKU: ${itemsWithWbSku.length} из ${products.length}`);

    const stockUpdates = itemsWithWbSku.map(product => {
      const wbSku = product.wildberriesSku!;
      const numericWbSku = parseInt(wbSku);
      
      if (isNaN(numericWbSku)) {
        console.warn(`⚠️ [STOCK UPDATE] Неверный формат WB SKU для товара ${product.sku || product.articleNumber}: ${wbSku}`);
        return null;
      }
      
      const stockData = {
        offer_id: numericWbSku.toString(),
        stock: product.stock || product.stockQuantity || 0,
        sku: product.sku || product.articleNumber || product.id,
        name: product.name || product.title || 'Без названия'
      };
      
      console.log(`📤 [STOCK UPDATE] Подготовлен: "${product.title?.substring(0, 30)}..." -> WB SKU: ${stockData.offer_id}, остаток: ${stockData.stock}`);
      
      return stockData;
    }).filter(Boolean);

    console.log(`🎯 [STOCK UPDATE] ИТОГО подготовлено для WB API: ${stockUpdates.length} товаров`);
    return stockUpdates;
  };

  const getOzonStockUpdates = () => {
    return products.filter(product => product.wildberriesSku && product.wildberriesSku.trim() !== '')
      .map(product => ({
        offer_id: product.sku || product.articleNumber || product.id,
        stock: product.stock || product.stockQuantity || 0,
        sku: product.sku || product.articleNumber || product.id,
        name: product.name || product.title || 'Без названия'
      }));
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      console.log(`🚀 [STOCK UPDATE] Начинаем обновление остатков для: ${marketplace}`);
      console.log(`📊 [STOCK UPDATE] Всего товаров в Supabase: ${products.length}`);
      
      if (products.length === 0) {
        toast.error('❌ В базе данных нет товаров!', {
          description: 'Сначала добавьте товары в каталог через раздел "Товары".'
        });
        return;
      }
      
      let stockUpdates;
      if (marketplace === 'wildberries') {
        stockUpdates = getWildberriesStockUpdates();
      } else {
        stockUpdates = getOzonStockUpdates();
      }
      
      console.log(`📊 [STOCK UPDATE] Подготовленные данные для ${marketplace}:`, stockUpdates.slice(0, 3));

      if (stockUpdates.length === 0) {
        const totalItems = products.length;
        const itemsWithoutSku = products.filter(p => !p.wildberriesSku || p.wildberriesSku.trim() === '');
        
        toast.warning(`⚠️ Нет товаров с ${marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'} SKU для обновления остатков`, {
          description: `Всего товаров: ${totalItems}, без SKU: ${itemsWithoutSku.length}. Сначала добавьте SKU в разделе "Товары".`
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

  // Показываем загрузку, если товары еще загружаются
  if (productsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Загрузка товаров из базы данных...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = products.length;
  const itemsWithWbSku = products.filter(p => p.wildberriesSku && p.wildberriesSku.trim() !== '').length;

  return (
    <div className="space-y-6">
      {/* Statistics panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Статистика товаров (Supabase)
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
          {totalItems === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>В базе данных нет товаров!</strong> Сначала добавьте товары через раздел "Товары" → "Импорт товаров".
              </p>
            </div>
          )}
          {totalItems > 0 && itemsWithWbSku === 0 && (
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
                disabled={syncing !== null || totalItems === 0}
                className="w-full"
                variant="outline"
              >
                <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
                {syncing === 'wildberries-stock' ? 'Обновление...' : `Обновить остатки Wildberries (${itemsWithWbSku})`}
              </Button>
              
              <Button 
                onClick={() => handleStockUpdate('ozon')}
                disabled={syncing !== null || totalItems === 0}
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
