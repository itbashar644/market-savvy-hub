
import React from 'react';
import { DetailedSyncLog } from '@/hooks/useDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface SyncLogsProps {
  logs: DetailedSyncLog[];
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Логи синхронизации</h3>
        <Badge variant="outline">{logs.length} записей</Badge>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Логи синхронизации отсутствуют</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{log.marketplace}</span>
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <span className="text-xs text-gray-500">{log.operation}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {log.timestamp && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                        </div>
                      )}
                      {log.executionTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{log.executionTime}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyncLogs;
