
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useWildberriesSync } from '@/hooks/database/useWildberriesSync';
import { useWildberriesStockUpdate } from '@/hooks/database/useWildberriesStockUpdate';

const ManualSyncControls = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { syncProducts: syncWbProducts } = useWildberriesSync();
  const { updateStock: updateWbStock } = useWildberriesStockUpdate();

  const handleWildberriesSync = async () => {
    setSyncing('wildberries-sync');
    try {
      await syncWbProducts();
      toast.success('✅ Синхронизация Wildberries завершена');
    } catch (error) {
      toast.error('❌ Ошибка синхронизации Wildberries');
    } finally {
      setSyncing(null);
    }
  };

  const handleOzonSync = async () => {
    setSyncing('ozon-sync');
    try {
      const response = await fetch('https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/ozon-stock-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwd3ZoeWF3dnhpYnR1eGZoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzIyOTUsImV4cCI6MjA2MjEwODI5NX0.-2aL1s3lUq4Oeos9jWoEd0Fn1g_-_oaQ_QWVEDByaOI`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success('✅ Синхронизация Ozon завершена');
      } else {
        toast.error('❌ Ошибка синхронизации Ozon: ' + result.error);
      }
    } catch (error) {
      console.error('Ozon sync error:', error);
      toast.error('❌ Ошибка синхронизации Ozon');
    } finally {
      setSyncing(null);
    }
  };

  const handleStockUpdate = async (marketplace: 'wildberries' | 'ozon') => {
    setSyncing(`${marketplace}-stock`);
    try {
      if (marketplace === 'wildberries') {
        // Пример данных для обновления остатков - в реальном проекте это должно приходить из формы
        const sampleProducts = [
          { nm_id: 123456, warehouse_id: 1, stock: 10 }
        ];
        await updateWbStock(sampleProducts);
      } else {
        // Для Ozon - здесь можно добавить аналогичную функциональность
        toast.info('Обновление остатков Ozon пока не реализовано');
      }
    } catch (error) {
      toast.error(`❌ Ошибка обновления остатков ${marketplace}`);
    } finally {
      setSyncing(null);
    }
  };

  return (
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
              Синхронизировать Wildberries
            </Button>
            
            <Button 
              onClick={handleOzonSync}
              disabled={syncing !== null}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing === 'ozon-sync' ? 'animate-spin' : ''}`} />
              Синхронизировать Ozon
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
            Обновите остатки товаров на маркетплейсах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={() => handleStockUpdate('wildberries')}
              disabled={syncing !== null}
              className="w-full"
              variant="outline"
            >
              <Upload className={`w-4 h-4 mr-2 ${syncing === 'wildberries-stock' ? 'animate-spin' : ''}`} />
              Обновить остатки Wildberries
            </Button>
            
            <Button 
              onClick={() => handleStockUpdate('ozon')}
              disabled={syncing !== null}
              className="w-full"
              variant="outline"
            >
              <Upload className={`w-4 h-4 mr-2 ${syncing === 'ozon-stock' ? 'animate-spin' : ''}`} />
              Обновить остатки Ozon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualSyncControls;
