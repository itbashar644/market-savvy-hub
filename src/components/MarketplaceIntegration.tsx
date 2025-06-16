
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import WildberriesProductsList from './marketplace/WildberriesProductsList';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplaceCredentials } from '@/hooks/database/useMarketplaceCredentials';

const MarketplaceIntegration = () => {
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { credentials } = useMarketplaceCredentials();

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    
    try {
      if (marketplace === 'Ozon') {
        const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
          body: {}
        });
        
        if (error) throw error;
        
        if (data.success) {
          toast({
            title: "Соединение установлено",
            description: "Подключение к Ozon API успешно",
          });
        } else {
          throw new Error(data.error || 'Ошибка подключения к Ozon');
        }
      } else if (marketplace === 'Wildberries') {
        const { data, error } = await supabase.functions.invoke('wildberries-connection-check', {
          body: {}
        });
        
        if (error) throw error;
        
        if (data.success) {
          toast({
            title: "Соединение установлено",
            description: "Подключение к Wildberries API успешно",
          });
        } else {
          throw new Error(data.error || 'Ошибка подключения к Wildberries');
        }
      }
    } catch (error: any) {
      toast({
        title: "Ошибка подключения",
        description: error.message || `Не удалось подключиться к ${marketplace}`,
        variant: "destructive",
      });
    } finally {
      setCheckingConnection(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    
    try {
      const wbCreds = credentials.Wildberries;
      const ozonCreds = credentials.Ozon;
      
      let syncCount = 0;
      
      // Синхронизация Wildberries
      if (wbCreds?.api_key) {
        const { data, error } = await supabase.functions.invoke('wildberries-products-list', {
          body: { apiKey: wbCreds.api_key }
        });
        
        if (!error && data.success) {
          syncCount++;
        }
      }
      
      // Синхронизация Ozon
      if (ozonCreds?.api_key && ozonCreds?.client_id) {
        const { data, error } = await supabase.functions.invoke('ozon-products-list', {
          body: { 
            apiKey: ozonCreds.api_key,
            clientId: ozonCreds.client_id 
          }
        });
        
        if (!error && data.success) {
          syncCount++;
        }
      }
      
      if (syncCount > 0) {
        toast({
          title: "Синхронизация завершена",
          description: `Синхронизировано ${syncCount} маркетплейса(-ов)`,
        });
      } else {
        toast({
          title: "Нет данных для синхронизации",
          description: "Убедитесь, что API ключи настроены правильно",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось выполнить синхронизацию",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Интеграции с маркетплейсами</h1>
          <p className="text-muted-foreground">
            Управление интеграциями с Wildberries и Ozon
          </p>
        </div>
        <Button 
          onClick={handleSyncAll}
          disabled={syncing}
          size="lg"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Синхронизация...' : 'Синхронизировать все'}
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="wb-products">Товары ВБ</TabsTrigger>
          <TabsTrigger value="rules">Правила обновления</TabsTrigger>
          <TabsTrigger value="logs">Логи синхронизации</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <MarketplaceSettings 
            handleCheckConnection={handleCheckConnection}
            checkingConnection={checkingConnection}
          />
        </TabsContent>

        <TabsContent value="wb-products">
          <WildberriesProductsList />
        </TabsContent>

        <TabsContent value="rules">
          <UpdateRules />
        </TabsContent>

        <TabsContent value="logs">
          <SyncLogs logs={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceIntegration;
