
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailedSyncLog } from '@/hooks/useDatabase';
import SyncLogsList from './logs/SyncLogsList';
import EdgeFunctionLogs from './logs/EdgeFunctionLogs';

interface SyncLogsProps {
  logs: DetailedSyncLog[];
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="sync-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync-logs">Логи синхронизации</TabsTrigger>
          <TabsTrigger value="edge-logs">Edge Function Логи</TabsTrigger>
        </TabsList>

        <TabsContent value="sync-logs" className="space-y-4">
          <SyncLogsList logs={logs} />
        </TabsContent>

        <TabsContent value="edge-logs" className="space-y-4">
          <EdgeFunctionLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SyncLogs;
