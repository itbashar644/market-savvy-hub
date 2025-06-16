
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { SyncLog } from '@/types/marketplace';

interface SyncLogsProps {
  logs: SyncLog[];
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История синхронизации</CardTitle>
        <CardDescription>Последние операции с маркетплейсами</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                </div>
              </div>
              <span className="text-sm text-gray-500">{log.timestamp}</span>
            </div>
          )) : <p className="text-sm text-gray-500">Нет логов для отображения.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncLogs;
