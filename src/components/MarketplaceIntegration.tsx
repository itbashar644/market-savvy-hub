
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import ManualSyncControls from './marketplace/ManualSyncControls';
import UnifiedAutoSyncSettings from './marketplace/UnifiedAutoSyncSettings';
import { MarketplaceConnectionChecker } from './marketplace/MarketplaceConnectionChecker';
import { useSyncLogs } from '@/hooks/useDatabase';

const MarketplaceIntegration = () => {
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);
  const { logs } = useSyncLogs();

  const handleCheckConnection = async (marketplace: string, apiKey?: string, clientId?: string) => {
    setCheckingConnection(marketplace);
    try {
      await MarketplaceConnectionChecker.checkConnection(marketplace, apiKey, clientId);
    } finally {
      setCheckingConnection(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Интеграция с маркетплейсами</h1>
        <p className="text-muted-foreground">
          Управление подключениями к маркетплейсам и unified синхронизация данных
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Для корректной работы интеграции убедитесь, что все API ключи актуальны и имеют необходимые права доступа.
          Система поддерживает автоматическую синхронизацию товаров и остатков с приоритизацией.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="sync">Ручная синхронизация</TabsTrigger>
          <TabsTrigger value="auto-sync">Unified автосинхронизация</TabsTrigger>
          <TabsTrigger value="logs">Логи и мониторинг</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <MarketplaceSettings 
            handleCheckConnection={handleCheckConnection}
            checkingConnection={checkingConnection}
          />
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <ManualSyncControls />
        </TabsContent>

        <TabsContent value="auto-sync" className="space-y-6">
          <UnifiedAutoSyncSettings />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История синхронизации и мониторинг</CardTitle>
              <CardDescription>
                Просмотр логов синхронизации товаров и обновления остатков с детальной статистикой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncLogs logs={logs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceIntegration;
