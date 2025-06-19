
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ManualSyncButtonsProps {
  syncing: string | null;
  onWildberriesSync: () => void;
  onOzonSync: () => void;
}

export const ManualSyncButtons: React.FC<ManualSyncButtonsProps> = ({
  syncing,
  onWildberriesSync,
  onOzonSync
}) => {
  return (
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
            onClick={onWildberriesSync}
            disabled={syncing !== null}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing === 'wildberries-sync' ? 'animate-spin' : ''}`} />
            {syncing === 'wildberries-sync' ? 'Синхронизация...' : 'Синхронизировать Wildberries'}
          </Button>
          
          <Button 
            onClick={onOzonSync}
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
  );
};
