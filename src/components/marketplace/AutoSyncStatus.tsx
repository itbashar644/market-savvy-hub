
import React from 'react';
import { RefreshCw, Upload } from 'lucide-react';
import { useInventory } from '@/hooks/database/useInventory';

interface SyncStatus {
  isRunning: boolean;
  lastProductSyncTime: Date | null;
  lastStockUpdateTime: Date | null;
  nextProductSyncTime: Date | null;
  nextStockUpdateTime: Date | null;
  productSyncInterval: number;
  stockUpdateInterval: number;
}

interface AutoSyncStatusProps {
  status: SyncStatus;
}

const AutoSyncStatus = ({ status }: AutoSyncStatusProps) => {
  const { inventory } = useInventory();
  
  const formatTime = (date: Date | null) => {
    if (!date) return 'Не запланировано';
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const stockUpdatesCount = inventory.filter(item => item.wildberries_sku).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Общий статус</span>
          <div className={`px-2 py-1 rounded text-xs ${status.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {status.isRunning ? '▶️ Активна' : '⏸️ Остановлена'}
          </div>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>Товаров с WB SKU: {stockUpdatesCount}</div>
          <div>Интервал синхронизации: {status.productSyncInterval === 0 ? 'Отключено' : `${status.productSyncInterval} мин`}</div>
          <div>Интервал остатков: {status.stockUpdateInterval} мин</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Синхронизация товаров</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Последняя: {formatTime(status.lastProductSyncTime)}</div>
            <div>Следующая: {status.productSyncInterval === 0 ? 'Отключено' : formatTime(status.nextProductSyncTime)}</div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Обновление остатков</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Последнее: {formatTime(status.lastStockUpdateTime)}</div>
            <div>Следующее: {formatTime(status.nextStockUpdateTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoSyncStatus;
