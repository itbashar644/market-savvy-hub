
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DetailedSyncLog } from '@/hooks/useDatabase';

interface SyncLogsProps {
  logs: DetailedSyncLog[];
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
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

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-4">
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
            </div>
          </div>
          <span className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</span>
        </div>
      )) : (
        <p className="text-sm text-gray-500 text-center py-8">Нет логов для отображения.</p>
      )}
    </div>
  );
};

export default SyncLogs;
