
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useOzonSync } from '@/hooks/database/useOzonSync';
import InventoryStats from './InventoryStats';
import StockUpdateControls from './StockUpdateControls';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { syncProducts: syncOzonProducts } = useOzonSync();

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

  return (
    <div className="space-y-6">
      <InventoryStats />

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

        <StockUpdateControls />
      </div>
    </div>
  );
};

export default ManualSyncControls;
