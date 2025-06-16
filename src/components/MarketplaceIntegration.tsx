
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import WildberriesProductsList from './marketplace/WildberriesProductsList';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MarketplaceIntegration = () => {
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    
    try {
      if (marketplace === 'Ozon') {
        const { data, error } = await supabase.functions.invoke('ozon-connection-check');
        
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
        const { data, error } = await supabase.functions.invoke('wildberries-connection-check');
        
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Интеграции с маркетплейсами</h1>
        <p className="text-muted-foreground">
          Управление интеграциями с Wildberries и Ozon
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="products">Товары WB</TabsTrigger>
          <TabsTrigger value="rules">Правила обновления</TabsTrigger>
          <TabsTrigger value="logs">Логи синхронизации</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <MarketplaceSettings 
            handleCheckConnection={handleCheckConnection}
            checkingConnection={checkingConnection}
          />
        </TabsContent>

        <TabsContent value="products">
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
