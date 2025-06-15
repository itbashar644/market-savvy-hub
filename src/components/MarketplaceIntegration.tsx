import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useInventory, useMarketplaceCredentials } from '@/hooks/useDatabase';
import { useSyncLogs } from '@/hooks/database/useSyncLogs';
import { useLastSyncTimes } from '@/hooks/database/useLastSyncTimes';
import { useAutoSync } from '@/hooks/database/useAutoSync';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

import MarketplaceCard from './marketplace/MarketplaceCard';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import ProductsListModal from './marketplace/ProductsListModal';
import SyncResultModal from './marketplace/SyncResultModal';
import { Marketplace } from '@/types/marketplace';

const MarketplaceIntegration = () => {
  const { toast } = useToast();
  const { inventory } = useInventory();
  const { credentials } = useMarketplaceCredentials();
  const { logs, addLog } = useSyncLogs();
  const { lastSyncTimes, updateLastSync } = useLastSyncTimes();
  const { 
    autoSyncEnabled, 
    setAutoSyncEnabled, 
    syncInterval, 
    setSyncInterval, 
    lastAutoSync,
    setOnSyncFunction 
  } = useAutoSync();
  
  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};

  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncingMarketplace, setSyncingMarketplace] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [showSyncResultModal, setShowSyncResultModal] = useState(false);
  const [syncResults, setSyncResults] = useState<any[]>([]);

  const marketplaces: Marketplace[] = [
    {
      name: 'Ozon',
      status: ozonCreds.api_key && ozonCreds.client_id ? 'connected' : 'not-configured',
      lastSync: lastSyncTimes['Ozon'] || 'Никогда',
      products: 156,
      orders: 23,
      color: 'bg-blue-600',
      icon: '🛍️'
    },
    {
      name: 'Wildberries',
      status: wbCreds.api_key ? 'connected' : 'not-configured',
      lastSync: lastSyncTimes['Wildberries'] || 'Никогда',
      products: 142,
      orders: 18,
      color: 'bg-purple-600',
      icon: '🛒'
    },
    {
      name: 'Яндекс.Маркет',
      status: 'disconnected',
      lastSync: 'Никогда',
      products: 0,
      orders: 0,
      color: 'bg-yellow-600',
      icon: '🏪'
    }
  ];

  const handleSync = async (marketplace: string) => {
    console.log(`Starting sync with ${marketplace}`);

    if (marketplace === 'Wildberries') {
      if (!wbCreds.api_key) {
        toast({
          title: "Не указан API ключ",
          description: "Пожалуйста, укажите и сохраните API ключ в настройках Wildberries.",
          variant: "destructive",
        });
        return;
      }

      setSyncInProgress(true);
      setSyncingMarketplace(marketplace);

      const stocks = inventory.map(item => ({
        offer_id: item.sku,
        stock: item.currentStock,
      }));

      try {
        const { data, error } = await supabase.functions.invoke('wildberries-stock-sync', {
          body: { 
            stocks, 
            apiKey: wbCreds.api_key,
          },
        });

        if (error) throw error;
        
        const wbResult = data.result;
        const successUpdates = wbResult.filter((r: { updated: boolean; }) => r.updated);
        const failedUpdates = wbResult.filter((r: { updated: boolean; }) => !r.updated);

        updateLastSync(marketplace);

        if (failedUpdates.length > 0) {
          setSyncResults(wbResult);
          setSelectedMarketplace(marketplace);
          setShowSyncResultModal(true);
          
          addLog({
            marketplace,
            action: 'Обновление остатков',
            status: 'error',
            details: `Обновлено ${successUpdates.length} товаров, ${failedUpdates.length} с ошибками`,
            successCount: successUpdates.length,
            errorCount: failedUpdates.length
          });
          
          toast({
            title: "Ошибка синхронизации с Wildberries",
            description: `Не удалось обновить ${failedUpdates.length} товаров. Нажмите для подробностей.`,
            variant: "destructive"
          });
        } else {
          addLog({
            marketplace,
            action: 'Обновление остатков',
            status: 'success',
            details: `Остатки для ${stocks.length} товаров успешно обновлены`,
            successCount: successUpdates.length,
            errorCount: 0
          });
          
          toast({
            title: "Синхронизация с Wildberries завершена",
            description: `Остатки для ${stocks.length} товаров успешно отправлены.`,
          });
        }

      } catch (error: any) {
        console.error('Error syncing with Wildberries:', error);
        let description = "Произошла неизвестная ошибка.";

        if (error instanceof FunctionsHttpError) {
          try {
            const errorJson = await error.context.json();
            description = errorJson.error || JSON.stringify(errorJson);
          } catch {
            description = error.context.statusText || 'Не удалось получить детали ошибки от сервера.';
          }
        } else {
          description = error.message;
        }

        addLog({
          marketplace,
          action: 'Обновление остатков',
          status: 'error',
          details: `Ошибка синхронизации: ${description}`,
          successCount: 0,
          errorCount: inventory.length
        });

        toast({
          title: "Ошибка синхронизации с Wildberries",
          description,
          variant: "destructive"
        });
      } finally {
        setSyncInProgress(false);
        setSyncingMarketplace(null);
      }
      return;
    }

    if (marketplace !== 'Ozon') {
      toast({
        title: "Функционал в разработке",
        description: `Синхронизация с ${marketplace} пока не доступна.`,
        variant: "default",
      });
      return;
    }

    if (!ozonCreds.api_key || !ozonCreds.client_id) {
      toast({
        title: "Не указаны API ключ или Client ID",
        description: "Пожалуйста, укажите и сохраните API ключ и Client ID в настройках Ozon.",
        variant: "destructive",
      });
      return;
    }

    if (!ozonCreds.warehouse_id) {
        toast({
            title: "Не указан Warehouse ID",
            description: "Пожалуйста, укажите и сохраните Warehouse ID в настройках Ozon.",
            variant: "destructive",
        });
        return;
    }

    if (!inventory || inventory.length === 0) {
      toast({
        title: "Нет товаров для синхронизации",
        description: "В инвентаре нет товаров для отправки на Ozon.",
        variant: "destructive",
      });
      return;
    }

    setSyncInProgress(true);
    setSyncingMarketplace(marketplace);

    const stocks = inventory.map(item => ({
      offer_id: item.sku,
      stock: item.currentStock,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ozon-stock-sync', {
        body: { 
          stocks, 
          warehouseId: ozonCreds.warehouse_id,
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id,
        },
      });

      if (error) throw error;
      
      const ozonResult = data.result;
      const successUpdates = ozonResult.filter((r: { updated: boolean; }) => r.updated);
      const failedUpdates = ozonResult.filter((r: { updated: boolean; }) => !r.updated);

      updateLastSync(marketplace);

      if (failedUpdates.length > 0) {
        setSyncResults(ozonResult);
        setSelectedMarketplace(marketplace);
        setShowSyncResultModal(true);
        
        addLog({
          marketplace,
          action: 'Обновление остатков',
          status: failedUpdates.length === ozonResult.length ? 'error' : 'success',
          details: successUpdates.length > 0 
            ? `Обновлено ${successUpdates.length} товаров, ${failedUpdates.length} с ошибками`
            : `Не удалось обновить ${failedUpdates.length} товаров`,
          successCount: successUpdates.length,
          errorCount: failedUpdates.length
        });
        
        if (successUpdates.length > 0) {
          toast({
            title: "Частичная синхронизация с Ozon",
            description: `Обновлено ${successUpdates.length} товаров, ${failedUpdates.length} с ошибками. Смотрите детали.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Ошибка синхронизации с Ozon",
            description: `Не удалось обновить ${failedUpdates.length} товаров. Смотрите детали.`,
            variant: "destructive"
          });
        }
      } else {
        addLog({
          marketplace,
          action: 'Обновление остатков',
          status: 'success',
          details: `Остатки для ${successUpdates.length} товаров успешно обновлены`,
          successCount: successUpdates.length,
          errorCount: 0
        });
        
        toast({
          title: "Синхронизация с Ozon завершена",
          description: `Остатки для ${successUpdates.length} товаров успешно обновлены.`,
        });
      }

    } catch (error: any) {
      console.error('Error syncing with Ozon:', error);
      let description = "Произошла неизвестная ошибка.";

      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          description = errorJson.error || JSON.stringify(errorJson);
        } catch {
          description = error.context.statusText || 'Не удалось получить детали ошибки от сервера.';
        }
      } else {
        description = error.message;
      }

      addLog({
        marketplace,
        action: 'Обновление остатков',
        status: 'error',
        details: `Ошибка синхронизации: ${description}`,
        successCount: 0,
        errorCount: inventory.length
      });

      toast({
        title: "Ошибка синхронизации с Ozon",
        description,
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
      setSyncingMarketplace(null);
    }
  };

  // Регистрируем функцию синхронизации для автосинхронизации
  useEffect(() => {
    setOnSyncFunction(handleSync);
  }, [handleSync, setOnSyncFunction]);

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    let apiKey, clientId;

    try {
      if (marketplace === 'Ozon') {
        apiKey = ozonCreds.api_key;
        clientId = ozonCreds.client_id;
        if (!apiKey || !clientId) {
          toast({
            title: "Не указаны обязательные поля",
            description: "Пожалуйста, укажите API ключ и Client ID для Ozon.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
          body: { 
            apiKey, 
            clientId
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Ozon",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Ozon",
            description: data.error,
            variant: "destructive",
          });
        }
      } else if (marketplace === 'Wildberries') {
        apiKey = wbCreds.api_key;
        if (!apiKey) {
          toast({
            title: "Не указан API ключ",
            description: "Пожалуйста, укажите API ключ для Wildberries.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('wildberries-connection-check', {
          body: { apiKey },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Wildberries",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Wildberries",
            description: data.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Функционал в разработке",
          description: `Проверка подключения для ${marketplace} пока не доступна.`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error checking connection:', error);
      toast({
        title: "Ошибка проверки подключения",
        description: error.message || "Произошла неизвестная ошибка.",
        variant: "destructive"
      });
    } finally {
      setCheckingConnection(null);
    }
  };

  const handleShowProducts = (marketplace: string) => {
    setSelectedMarketplace(marketplace);
    setShowProductsModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Интеграция с маркетплейсами</h1>
          <p className="text-gray-600 mt-1">Управление подключениями и синхронизацией данных</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Автосинхронизация:</span>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>
          {lastAutoSync && (
            <span className="text-xs text-gray-500">
              Последняя автосинхронизация: {lastAutoSync}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketplaces.map((marketplace) => (
          <MarketplaceCard 
            key={marketplace.name}
            marketplace={marketplace}
            onSync={handleSync}
            onShowProducts={handleShowProducts}
            syncInProgress={syncInProgress}
            syncingMarketplace={syncingMarketplace}
          />
        ))}
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Настройки API</TabsTrigger>
          <TabsTrigger value="logs">Логи синхронизации</TabsTrigger>
          <TabsTrigger value="rules">Правила обновления</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <MarketplaceSettings 
            handleCheckConnection={handleCheckConnection}
            checkingConnection={checkingConnection}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SyncLogs logs={logs} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <UpdateRules 
            syncInterval={syncInterval}
            setSyncInterval={setSyncInterval}
            autoSyncEnabled={autoSyncEnabled}
          />
        </TabsContent>
      </Tabs>

      <ProductsListModal
        isOpen={showProductsModal}
        onClose={() => setShowProductsModal(false)}
        marketplace={selectedMarketplace}
      />

      <SyncResultModal
        isOpen={showSyncResultModal}
        onClose={() => setShowSyncResultModal(false)}
        marketplace={selectedMarketplace}
        results={syncResults}
      />
    </div>
  );
};

export default MarketplaceIntegration;
