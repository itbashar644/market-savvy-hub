import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useInventory, useMarketplaceCredentials } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

import MarketplaceCard from './marketplace/MarketplaceCard';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import ProductsListModal from './marketplace/ProductsListModal';
import SyncResultModal from './marketplace/SyncResultModal';
import { Marketplace, SyncLog } from '@/types/marketplace';

const MarketplaceIntegration = () => {
  const { toast } = useToast();
  const { inventory } = useInventory();
  const { credentials } = useMarketplaceCredentials();
  
  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};

  const [autoSync, setAutoSync] = useState(true);
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
      lastSync: '2024-01-15 14:30',
      products: 156,
      orders: 23,
      color: 'bg-blue-600',
      icon: '🛍️'
    },
    {
      name: 'Wildberries',
      status: wbCreds.api_key ? 'connected' : 'not-configured',
      lastSync: '2024-01-15 14:25',
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

  const syncLogs: SyncLog[] = [
    {
      id: 1,
      marketplace: 'Ozon',
      action: 'Обновление остатков',
      status: 'success',
      timestamp: '2024-01-15 14:30:15',
      details: 'Обновлено 45 товаров'
    },
    {
      id: 2,
      marketplace: 'Wildberries',
      action: 'Загрузка заказов',
      status: 'success',
      timestamp: '2024-01-15 14:25:32',
      details: 'Загружено 12 новых заказов'
    },
    {
      id: 3,
      marketplace: 'Ozon',
      action: 'Обновление цен',
      status: 'error',
      timestamp: '2024-01-15 14:20:45',
      details: 'Ошибка API: недействительный ключ'
    }
  ];

  // Новая функция для прямой проверки подключения к Wildberries
  const checkWildberriesConnectionDirect = async (apiKey: string) => {
    try {
      console.log('Direct connection check to Wildberries...');
      
      // Пробуем несколько эндпоинтов
      const endpoints = [
        'https://suppliers-api.wildberries.ru/api/v3/warehouses',
        'https://suppliers-api.wildberries.ru/public/api/v1/info'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': apiKey,
              'Accept': 'application/json',
            },
            mode: 'cors'
          });

          console.log(`Response from ${endpoint}:`, response.status);
          
          if (response.ok || response.status === 401 || response.status === 403) {
            // Даже если получили 401/403, это означает что API доступен
            if (response.status === 401 || response.status === 403) {
              return { success: false, error: 'Неверный API ключ или недостаточно прав доступа' };
            }
            return { success: true, message: 'Подключение к Wildberries успешно установлено' };
          }
        } catch (err) {
          console.log(`Error with ${endpoint}:`, err);
          continue;
        }
      }
      
      throw new Error('Все эндпоинты недоступны');
    } catch (error: any) {
      console.error('Direct connection error:', error);
      return { 
        success: false, 
        error: 'Не удается подключиться к API Wildberries. Возможно, проблема с CORS или сетью.' 
      };
    }
  };

  // Функция для прямой синхронизации с Wildberries
  const syncWildberriesDirect = async (stocks: any[], apiKey: string) => {
    try {
      console.log('Direct sync to Wildberries with stocks:', stocks);

      // Сначала получаем список складов
      const warehousesResponse = await fetch('https://suppliers-api.wildberries.ru/api/v3/warehouses', {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!warehousesResponse.ok) {
        throw new Error(`Ошибка получения складов: ${warehousesResponse.status}`);
      }

      const warehouses = await warehousesResponse.json();
      if (!warehouses || warehouses.length === 0) {
        throw new Error('Склады не найдены');
      }

      const warehouseId = warehouses[0].id;
      console.log('Using warehouse:', warehouseId);

      // Обновляем остатки
      const stocksPayload = {
        stocks: stocks.map(item => ({
          sku: item.offer_id,
          amount: item.stock,
          warehouseId: warehouseId
        }))
      };

      const stocksResponse = await fetch(`https://suppliers-api.wildberries.ru/api/v3/stocks/${warehouseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
        },
        body: JSON.stringify(stocksPayload),
        mode: 'cors'
      });

      if (!stocksResponse.ok) {
        throw new Error(`Ошибка обновления остатков: ${stocksResponse.status}`);
      }

      // Формируем результат
      return {
        result: stocks.map(item => ({
          offer_id: item.offer_id,
          updated: true,
          errors: []
        }))
      };

    } catch (error: any) {
      console.error('Direct sync error:', error);
      return {
        result: stocks.map(item => ({
          offer_id: item.offer_id,
          updated: false,
          errors: [{
            code: 'DIRECT_SYNC_ERROR',
            message: error.message
          }]
        }))
      };
    }
  };

  const handleSync = async (marketplace: string) => {
    console.log(`Starting sync with ${marketplace}`);
    console.log('Current inventory:', inventory);

    if (marketplace === 'Wildberries') {
      if (!wbCreds.api_key) {
        toast({
          title: "Не указан API ключ",
          description: "Пожалуйста, укажите и сохраните API ключ в настройках Wildberries.",
          variant: "destructive",
        });
        return;
      }

      if (!inventory || inventory.length === 0) {
        toast({
          title: "Нет товаров для синхронизации",
          description: "В инвентаре нет товаров для отправки на Wildberries.",
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

      console.log('Syncing stocks to Wildberries:', stocks);

      try {
        // Используем прямую синхронизацию
        const result = await syncWildberriesDirect(stocks, wbCreds.api_key);
        const failedUpdates = result.result.filter((r: { updated: boolean; }) => !r.updated);

        if (failedUpdates.length > 0) {
          console.error('Failed Wildberries updates:', failedUpdates);
          setSyncResults(result.result);
          setSelectedMarketplace(marketplace);
          setShowSyncResultModal(true);
          toast({
            title: "Ошибка синхронизации с Wildberries",
            description: `Не удалось обновить ${failedUpdates.length} товаров. Нажмите для подробностей.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Синхронизация с Wildberries завершена",
            description: `Остатки для ${stocks.length} товаров успешно отправлены.`,
          });
        }

      } catch (error: any) {
        console.error('Error syncing with Wildberries:', error);
        toast({
          title: "Ошибка синхронизации с Wildberries",
          description: error.message || "Произошла неизвестная ошибка.",
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

    console.log('Ozon credentials check:', ozonCreds);

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

    console.log('Sending Ozon request with:', {
      hasApiKey: !!ozonCreds.api_key,
      hasClientId: !!ozonCreds.client_id,
      hasWarehouseId: !!ozonCreds.warehouse_id,
      warehouseId: ozonCreds.warehouse_id,
      stocksCount: stocks.length,
      stocksSample: stocks.slice(0, 3)
    });

    try {
      const { data, error } = await supabase.functions.invoke('ozon-stock-sync', {
        body: { 
          stocks, 
          warehouseId: ozonCreds.warehouse_id,
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id,
        },
      });

      console.log('Supabase function response:', { data, error });

      if (error) throw error;
      
      const ozonResult = data.result;
      const successUpdates = ozonResult.filter((r: { updated: boolean; }) => r.updated);
      const failedUpdates = ozonResult.filter((r: { updated: boolean; }) => !r.updated);

      console.log('Sync results:', {
        total: ozonResult.length,
        success: successUpdates.length,
        failed: failedUpdates.length
      });

      if (failedUpdates.length > 0) {
        console.error('Failed Ozon updates:', failedUpdates);
        setSyncResults(ozonResult);
        setSelectedMarketplace(marketplace);
        setShowSyncResultModal(true);
        
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
        const apiKey = wbCreds.api_key;
        if (!apiKey) {
          toast({
            title: "Не указан API ключ",
            description: "Пожалуйста, укажите API ключ для Wildberries.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        // Используем прямую проверку подключения
        const result = await checkWildberriesConnectionDirect(apiKey);

        if (result.success) {
          toast({
            title: "Подключение к Wildberries",
            description: result.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Wildberries",
            description: result.error,
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
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Автосинхронизация:</span>
          <Switch
            checked={autoSync}
            onCheckedChange={setAutoSync}
          />
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
          <SyncLogs logs={syncLogs} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <UpdateRules />
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
