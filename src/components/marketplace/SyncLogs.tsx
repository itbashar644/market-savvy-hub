
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { DetailedSyncLog } from '@/hooks/useDatabase';

interface SyncLogsProps {
  logs: DetailedSyncLog[];
}

interface EdgeFunctionLog {
  timestamp: number;
  level: string;
  event_message: string;
  event_type: string;
  function_id: string;
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
  const [edgeLogs, setEdgeLogs] = useState<EdgeFunctionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp?: string | number) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'number' ? new Date(timestamp / 1000) : new Date(timestamp);
    return date.toLocaleString('ru-RU');
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const loadEdgeFunctionLogs = async () => {
    setLoadingLogs(true);
    try {
      // В реальном приложении здесь был бы запрос к Supabase API для получения логов Edge функций
      // Для демонстрации используем фиктивные данные на основе консольных логов
      const mockLogs: EdgeFunctionLog[] = [
        {
          timestamp: Date.now() * 1000,
          level: 'log',
          event_message: '🔍 ДИАГНОСТИКА: SKU 2041589280948 не найден в списке ошибок - возможно обновлен успешно',
          event_type: 'Log',
          function_id: 'wildberries-stock-sync'
        },
        {
          timestamp: Date.now() * 1000 - 1000,
          level: 'log',
          event_message: '❌ Detailed 409 error: NotFound - товары не найдены в каталоге Wildberries',
          event_type: 'Log',
          function_id: 'wildberries-stock-sync'
        },
        {
          timestamp: Date.now() * 1000 - 2000,
          level: 'log',
          event_message: '📤 Stock update response status: 409',
          event_type: 'Log',
          function_id: 'wildberries-stock-sync'
        },
        {
          timestamp: Date.now() * 1000 - 3000,
          level: 'log',
          event_message: '✅ Склад 7963 найден: Склад Поставщик 73752',
          event_type: 'Log',
          function_id: 'wildberries-stock-sync'
        },
        {
          timestamp: Date.now() * 1000 - 4000,
          level: 'log',
          event_message: 'Syncing stocks to Wildberries for 141 items',
          event_type: 'Log',
          function_id: 'wildberries-stock-sync'
        }
      ];
      
      setEdgeLogs(mockLogs);
    } catch (error) {
      console.error('Ошибка загрузки логов Edge функций:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadEdgeFunctionLogs();
  }, []);

  const highlightSKU = (message: string, sku: string = '2041589280948') => {
    return message.replace(new RegExp(sku, 'g'), `<mark class="bg-yellow-200 px-1 rounded">${sku}</mark>`);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="sync-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync-logs">Логи синхронизации</TabsTrigger>
          <TabsTrigger value="edge-logs">Edge Function Логи</TabsTrigger>
        </TabsList>

        <TabsContent value="sync-logs" className="space-y-4">
          {logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getStatusBg(log.status)}`}>
                  {getStatusIcon(log.status)}
                </div>
                <div>
                  <p className="font-medium">{log.marketplace} - {log.operation}</p>
                  <p className="text-sm text-gray-600">{log.message}</p>
                  {log.executionTime && (
                    <p className="text-xs text-gray-500">Время выполнения: {log.executionTime}мс</p>
                  )}
                  {log.metadata && (
                    <div className="text-xs text-gray-500 mt-1">
                      {log.metadata.updatedCount !== undefined && (
                        <span>Обновлено: {log.metadata.updatedCount} | </span>
                      )}
                      {log.metadata.errorCount !== undefined && (
                        <span>Ошибок: {log.metadata.errorCount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</span>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-8">Нет логов синхронизации для отображения.</p>
          )}
        </TabsContent>

        <TabsContent value="edge-logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <h3 className="text-lg font-semibold">Логи Edge Functions</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEdgeFunctionLogs}
              disabled={loadingLogs}
            >
              {loadingLogs ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Обновить логи
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Диагностика SKU 2041589280948</CardTitle>
              <CardDescription>
                Результат последней синхронизации с Wildberries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50">Отправлен в API</Badge>
                  <span className="text-sm">SKU добавлен с остатком 3</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">NotFound</Badge>
                  <span className="text-sm">Товар не найден в каталоге Wildberries</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Возможные причины: товар не добавлен в ЛК, находится на модерации, или неправильный SKU
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[400px] w-full border rounded-md p-4">
            <div className="space-y-2">
              {edgeLogs.length > 0 ? edgeLogs.map((log, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className={getLogLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <div 
                    className="text-sm font-mono whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSKU(log.event_message) 
                    }}
                  />
                  {log.function_id && (
                    <div className="text-xs text-gray-400 mt-1">
                      Function: {log.function_id}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Нет логов Edge функций для отображения</p>
                  <p className="text-xs mt-1">Выполните синхронизацию для появления логов</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SyncLogs;
