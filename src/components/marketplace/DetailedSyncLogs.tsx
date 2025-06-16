
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, Database, Trash2, RefreshCw } from 'lucide-react';
import { DetailedSyncLog } from '@/hooks/database/useSyncLogs';

interface DetailedSyncLogsProps {
  logs: DetailedSyncLog[];
  onClearLogs: () => void;
}

const DetailedSyncLogs: React.FC<DetailedSyncLogsProps> = ({ logs, onClearLogs }) => {
  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return duration < 1000 ? `${duration}мс` : `${(duration / 1000).toFixed(1)}с`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Проверка подключения':
        return <RefreshCw className="w-4 h-4" />;
      case 'Синхронизация товаров':
        return <Database className="w-4 h-4" />;
      case 'Обновление остатков':
        return <Clock className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    return status === 'success' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Успешно
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Ошибка
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Логи синхронизации</CardTitle>
            <CardDescription>
              Детальная история операций с маркетплейсами ({logs.length} записей)
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Очистить логи
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <div className="space-y-4">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {log.status === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{log.marketplace}</h4>
                        <div className="flex items-center space-x-1">
                          {getActionIcon(log.action)}
                          <span className="text-sm text-gray-600">{log.action}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(log.status)}
                    <div className="text-xs text-gray-500">{log.timestamp}</div>
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {log.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Время: {formatDuration(log.duration)}</span>
                    </div>
                  )}
                  
                  {log.itemsProcessed !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Database className="w-3 h-3" />
                      <span>Обработано: {log.itemsProcessed}</span>
                    </div>
                  )}
                  
                  {log.metadata?.warehouseId && (
                    <div>ID склада: {log.metadata.warehouseId}</div>
                  )}
                  
                  {log.metadata?.originalCount && (
                    <div>Исходно товаров: {log.metadata.originalCount}</div>
                  )}
                  
                  {log.metadata?.validCount && (
                    <div>Валидных: {log.metadata.validCount}</div>
                  )}
                </div>

                {/* Ошибки */}
                {log.errors && log.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h5 className="font-medium text-red-800 mb-2">Ошибки:</h5>
                    <div className="space-y-1">
                      {log.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <span className="font-medium">{error.item}:</span> {error.error}
                        </div>
                      ))}
                      {log.errors.length > 5 && (
                        <div className="text-sm text-red-600">
                          ... и ещё {log.errors.length - 5} ошибок
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Логи синхронизации пока отсутствуют</p>
                <p className="text-sm">Выполните операцию синхронизации для создания логов</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DetailedSyncLogs;
