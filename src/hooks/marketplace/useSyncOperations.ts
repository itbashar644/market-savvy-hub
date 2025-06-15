
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInventory, useMarketplaceCredentials } from '@/hooks/useDatabase';
import { useSyncLogs } from '@/hooks/database/useSyncLogs';
import { useLastSyncTimes } from '@/hooks/database/useLastSyncTimes';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

export const useSyncOperations = (showPersistentError: (title: string, description: string) => void) => {
  const { toast } = useToast();
  const { inventory } = useInventory();
  const { credentials } = useMarketplaceCredentials();
  const { addLog } = useSyncLogs();
  const { updateLastSync } = useLastSyncTimes();
  
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncingMarketplace, setSyncingMarketplace] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<any[]>([]);

  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};

  const handleSync = async (marketplace: string) => {
    console.log(`Starting sync with ${marketplace}`);
    console.log('Current inventory:', inventory);
    console.log('Inventory length:', inventory?.length || 0);

    if (marketplace === 'Wildberries') {
      if (!wbCreds.api_key) {
        showPersistentError(
          "Не указан API ключ",
          "Пожалуйста, укажите и сохраните API ключ в настройках Wildberries."
        );
        return;
      }

      if (!inventory || inventory.length === 0) {
        showPersistentError(
          "Нет товаров для синхронизации",
          "В инвентаре нет товаров для отправки на Wildberries."
        );
        console.log('No inventory items found for Wildberries sync');
        return;
      }

      setSyncInProgress(true);
      setSyncingMarketplace(marketplace);

      const stocks = inventory.map(item => ({
        offer_id: item.sku,
        stock: item.currentStock,
      }));

      console.log('Stocks to sync with Wildberries:', stocks);

      try {
        console.log('Sending stocks to Wildberries:', stocks);
        
        const { data, error } = await supabase.functions.invoke('wildberries-stock-sync', {
          body: { 
            stocks, 
            apiKey: wbCreds.api_key,
          },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        console.log('Wildberries sync response:', data);
        
        if (data && data.result) {
          const wbResult = data.result;
          const successUpdates = wbResult.filter((r: { updated: boolean; }) => r.updated);
          const failedUpdates = wbResult.filter((r: { updated: boolean; }) => !r.updated);

          updateLastSync(marketplace);

          if (failedUpdates.length > 0) {
            setSyncResults(wbResult);
            
            addLog({
              marketplace,
              action: 'Обновление остатков',
              status: 'error',
              details: `Обновлено ${successUpdates.length} товаров, ${failedUpdates.length} с ошибками`,
              successCount: successUpdates.length,
              errorCount: failedUpdates.length
            });
            
            showPersistentError(
              "Ошибка синхронизации с Wildberries",
              `Не удалось обновить ${failedUpdates.length} товаров. Проверьте детали в модальном окне.`
            );
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
              duration: 5000,
            });
          }
        } else {
          throw new Error('Получен некорректный ответ от сервера');
        }

      } catch (error: any) {
        console.error('Error syncing with Wildberries:', error);
        let description = "Произошла неизвестная ошибка.";

        if (error instanceof FunctionsHttpError) {
          try {
            const errorJson = await error.context.json();
            console.error('Function error details:', errorJson);
            description = errorJson.error || JSON.stringify(errorJson);
          } catch {
            description = error.context.statusText || 'Не удалось получить детали ошибки от сервера.';
          }
        } else if (error.message) {
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

        showPersistentError(
          "Ошибка синхронизации с Wildberries",
          description
        );
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
      showPersistentError(
        "Не указаны API ключ или Client ID",
        "Пожалуйста, укажите и сохраните API ключ и Client ID в настройках Ozon."
      );
      return;
    }

    if (!ozonCreds.warehouse_id) {
      showPersistentError(
        "Не указан Warehouse ID",
        "Пожалуйста, укажите и сохраните Warehouse ID в настройках Ozon."
      );
      return;
    }

    if (!inventory || inventory.length === 0) {
      showPersistentError(
        "Нет товаров для синхронизации",
        "В инвентаре нет товаров для отправки на Ozon."
      );
      console.log('No inventory items found for Ozon sync');
      return;
    }

    setSyncInProgress(true);
    setSyncingMarketplace(marketplace);

    const stocks = inventory.map(item => ({
      offer_id: item.sku,
      stock: item.currentStock,
    }));

    console.log('Stocks to sync with Ozon:', stocks);

    try {
      const { data, error } = await supabase.functions.invoke('ozon-stock-sync', {
        body: { 
          stocks, 
          warehouseId: ozonCreds.warehouse_id,
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id,
        },
      });

      if (error) {
        console.error('Ozon function error:', error);
        throw error;
      }

      console.log('Ozon sync response:', data);
      
      if (!data || !data.result) {
        throw new Error('Получен некорректный ответ от сервера Ozon');
      }
      
      const ozonResult = data.result;
      const successUpdates = ozonResult.filter((r: { updated: boolean; }) => r.updated);
      const failedUpdates = ozonResult.filter((r: { updated: boolean; }) => !r.updated);

      console.log('Ozon sync results:', {
        total: ozonResult.length,
        success: successUpdates.length,
        failed: failedUpdates.length
      });

      updateLastSync(marketplace);

      if (failedUpdates.length > 0) {
        setSyncResults(ozonResult);
        
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
          showPersistentError(
            "Ошибка синхронизации с Ozon",
            `Не удалось обновить ${failedUpdates.length} товаров. Смотрите детали.`
          );
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
          console.error('Function error details:', errorJson);
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
        errorCount: inventory?.length || 0
      });

      showPersistentError(
        "Ошибка синхронизации с Ozon",
        description
      );
    } finally {
      setSyncInProgress(false);
      setSyncingMarketplace(null);
    }
  };

  return {
    syncInProgress,
    syncingMarketplace,
    syncResults,
    handleSync,
    setSyncResults
  };
};
