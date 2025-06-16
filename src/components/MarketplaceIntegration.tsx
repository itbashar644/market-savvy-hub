
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
import { useWildberriesProducts } from '@/hooks/database/useWildberriesProducts';

const MarketplaceIntegration = () => {
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { credentials } = useMarketplaceCredentials();
  const { syncProducts, testConnection } = useWildberriesProducts();

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    
    try {
      if (marketplace === 'Ozon') {
        const ozonCreds = credentials.Ozon;
        
        if (!ozonCreds?.api_key || !ozonCreds?.client_id) {
          throw new Error('Необходимо указать API ключ и Client ID для Ozon');
        }

        const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
          body: {
            apiKey: ozonCreds.api_key,
            clientId: ozonCreds.client_id
          }
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
        const wbCreds = credentials.Wildberries;
        
        if (!wbCreds?.api_key) {
          throw new Error('Необходимо указать API ключ для Wildberries');
        }

        if (!wbCreds?.warehouse_id) {
          throw new Error('Необходимо указать ID склада для Wildberries');
        }

        // Используем новую функцию для проверки подключения
        testConnection(wbCreds.api_key, wbCreds.warehouse_id);
      }
    } catch (error: any) {
      console.error('Connection check error:', error);
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
      const errors = [];
      
      // Синхронизация товаров Wildberries
      if (wbCreds?.api_key && wbCreds?.warehouse_id) {
        try {
          console.log('Starting Wildberries products sync...');
          syncProducts(wbCreds.api_key, wbCreds.warehouse_id);
          syncCount++;
          console.log('Wildberries products sync initiated');
        } catch (error: any) {
          errors.push(`Wildberries: ${error.message}`);
          console.error('Wildberries sync error:', error);
        }
      }
      
      // Проверка подключения к Ozon
      if (ozonCreds?.api_key && ozonCreds?.client_id) {
        try {
          const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
            body: { 
              apiKey: ozonCreds.api_key,
              clientId: ozonCreds.client_id 
            }
          });
          
          if (error) throw error;
          
          if (data.success) {
            console.log('Ozon connection verified');
          } else {
            errors.push(`Ozon: ${data.error}`);
          }
        } catch (error: any) {
          errors.push(`Ozon: ${error.message}`);
        }
      }
      
      if (syncCount > 0) {
        toast({
          title: "Синхронизация запущена",
          description: `Начата синхронизация с ${syncCount} маркетплейсом(-ами)`,
        });
      } 
      
      if (errors.length > 0) {
        toast({
          title: "Ошибки при синхронизации",
          description: `Ошибки: ${errors.join(', ')}`,
          variant: "destructive",
        });
      }
      
      if (syncCount === 0 && errors.length === 0) {
        toast({
          title: "Нет настроенных подключений",
          description: "Убедитесь, что API ключи и ID складов настроены правильно",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Sync error:', error);
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
