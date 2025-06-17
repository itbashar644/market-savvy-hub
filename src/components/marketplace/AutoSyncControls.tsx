
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload } from 'lucide-react';
import { useAutoSync } from '@/hooks/database/useAutoSync';

const AutoSyncControls = () => {
  const { status, performProductSync, performStockUpdate } = useAutoSync();

  const handleManualProductSync = async () => {
    try {
      await performProductSync();
    } catch (error) {
      console.error('Manual product sync error:', error);
    }
  };

  const handleManualStockUpdate = async () => {
    try {
      await performStockUpdate();
    } catch (error) {
      console.error('Manual stock update error:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex gap-2">
        <Button 
          onClick={handleManualProductSync}
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={status.isRunning}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Синхр. товары
        </Button>
        <Button 
          onClick={handleManualStockUpdate}
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={status.isRunning}
        >
          <Upload className="w-3 h-3 mr-1" />
          Обновить остатки
        </Button>
      </div>
    </div>
  );
};

export default AutoSyncControls;
