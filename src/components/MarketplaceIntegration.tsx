
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLastSyncTimes } from '@/hooks/database/useLastSyncTimes';
import { useAutoSync } from '@/hooks/database/useAutoSync';
import { Marketplace } from '@/types/marketplace';

import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import ProductsListModal from './marketplace/ProductsListModal';
import SyncResultModal from './marketplace/SyncResultModal';
import MarketplaceGrid from './marketplace/MarketplaceGrid';
import ErrorDisplay from './marketplace/ErrorDisplay';

import { useMarketplaceStats } from '@/hooks/marketplace/useMarketplaceStats';
import { useErrorHandler } from '@/hooks/marketplace/useErrorHandler';
import { useSyncOperations } from '@/hooks/marketplace/useSyncOperations';
import { useConnectionCheck } from '@/hooks/marketplace/useConnectionCheck';
import { useMarketplaceCredentials } from '@/hooks/useDatabase';
import { useSyncLogs } from '@/hooks/database/useSyncLogs';

const MarketplaceIntegration = () => {
  const { credentials } = useMarketplaceCredentials();
  const { logs } = useSyncLogs();
  const { lastSyncTimes } = useLastSyncTimes();
  const { 
    autoSyncEnabled, 
    setAutoSyncEnabled, 
    syncInterval, 
    setSyncInterval, 
    lastAutoSync,
    setOnSyncFunction 
  } = useAutoSync();
  
  const { getMarketplaceStats } = useMarketplaceStats();
  const { lastError, showPersistentError, clearError } = useErrorHandler();
  const { 
    syncInProgress, 
    syncingMarketplace, 
    syncResults, 
    handleSync,
    setSyncResults 
  } = useSyncOperations(showPersistentError);
  const { checkingConnection, handleCheckConnection } = useConnectionCheck();

  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [showSyncResultModal, setShowSyncResultModal] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};
  const stats = getMarketplaceStats();

  const marketplaces: Marketplace[] = [
    {
      name: 'Ozon',
      status: ozonCreds.api_key && ozonCreds.client_id ? 'connected' : 'not-configured',
      lastSync: lastSyncTimes['Ozon'] || 'Никогда',
      products: stats.ozon.products,
      orders: stats.ozon.orders,
      color: 'bg-blue-600',
      icon: '🛍️'
    },
    {
      name: 'Wildberries',
      status: wbCreds.api_key ? 'connected' : 'not-configured',
      lastSync: lastSyncTimes['Wildberries'] || 'Никогда',
      products: stats.wb.products,
      orders: stats.wb.orders,
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

  // Регистрируем функцию синхронизации для автосинхронизации
  useEffect(() => {
    setOnSyncFunction(handleSync);
  }, [handleSync, setOnSyncFunction]);

  const handleShowProducts = (marketplace: string) => {
    setSelectedMarketplace(marketplace);
    setShowProductsModal(true);
  };

  const handleSettingsClick = (marketplace: string) => {
    // Переключаемся на вкладку настроек и фокусируемся на нужном маркетплейсе
    setActiveTab('settings');
    setSelectedMarketplace(marketplace);
  };

  const handleSyncWithModal = async (marketplace: string) => {
    try {
      await handleSync(marketplace);
      
      // Показываем модальное окно с результатами только если есть ошибки
      if (syncResults.length > 0) {
        const hasErrors = syncResults.some(r => !r.updated);
        if (hasErrors) {
          setSelectedMarketplace(marketplace);
          setShowSyncResultModal(true);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
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

      <ErrorDisplay lastError={lastError} onClear={clearError} />

      <MarketplaceGrid
        marketplaces={marketplaces}
        onSync={handleSyncWithModal}
        onShowProducts={handleShowProducts}
        onSettingsClick={handleSettingsClick}
        syncInProgress={syncInProgress}
        syncingMarketplace={syncingMarketplace}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
        onClose={() => {
          setShowSyncResultModal(false);
          setSyncResults([]);
        }}
        marketplace={selectedMarketplace}
        results={syncResults}
      />
    </div>
  );
};

export default MarketplaceIntegration;
