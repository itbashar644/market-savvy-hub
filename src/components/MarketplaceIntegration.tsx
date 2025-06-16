
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketplaceSettings from './marketplace/MarketplaceSettings';
import SyncLogs from './marketplace/SyncLogs';
import UpdateRules from './marketplace/UpdateRules';
import WildberriesProductsList from './marketplace/WildberriesProductsList';

const MarketplaceIntegration = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Интеграции с маркетплейсами</h1>
        <p className="text-muted-foreground">
          Управление интеграциями с Wildberries и Ozon
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="products">Товары WB</TabsTrigger>
          <TabsTrigger value="rules">Правила обновления</TabsTrigger>
          <TabsTrigger value="logs">Логи синхронизации</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <MarketplaceSettings />
        </TabsContent>

        <TabsContent value="products">
          <WildberriesProductsList />
        </TabsContent>

        <TabsContent value="rules">
          <UpdateRules />
        </TabsContent>

        <TabsContent value="logs">
          <SyncLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceIntegration;
