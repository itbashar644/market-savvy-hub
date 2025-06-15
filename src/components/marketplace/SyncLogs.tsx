
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { SyncLog } from '@/hooks/database/useSyncLogs';
import { useSyncLogs } from '@/hooks/database/useSyncLogs';

interface SyncLogsProps {
  logs: SyncLog[];
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
  const { clearLogs } = useSyncLogs();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>История синхронизации</CardTitle>
            <CardDescription>Реальные операции синхронизации с маркетплейсами</CardDescription>
          </div>
          {logs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearLogs}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Очистить логи
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {log.status === 'success' ? 
                    <CheckCircle className="w-4 h-4 text-green-600" /> :
                    <XCircle className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div>
                  <p className="font-medium">{log.marketplace} - {log.action}</p>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  {(log.successCount !== undefined || log.errorCount !== undefined) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {log.successCount !== undefined && `Успешно: ${log.successCount}`}
                      {log.successCount !== undefined && log.errorCount !== undefined && ' | '}
                      {log.errorCount !== undefined && `Ошибки: ${log.errorCount}`}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500">{log.timestamp}</span>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Нет записей о синхронизации. Выполните синхронизацию, чтобы увидеть логи здесь.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncLogs;
