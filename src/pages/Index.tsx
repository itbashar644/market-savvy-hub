
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import ProductsManager from '@/components/ProductsManager';
import MarketplaceIntegration from '@/components/MarketplaceIntegration';
import ChatWidget from '@/components/ChatWidget';
import OrdersManager from '@/components/OrdersManager';
import CustomersManager from '@/components/CustomersManager';
import InventoryManager from '@/components/InventoryManager';
import ReportsManager from '@/components/ReportsManager';
import AnalyticsManager from '@/components/AnalyticsManager';
import SettingsManager from '@/components/SettingsManager';
import { MarketplaceCredentialsProvider } from '@/hooks/useDatabase';
import { useDataSync } from '@/hooks/useDataSync';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isOnline, lastSync } = useDataSync();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
      case 'customers':
        return <CustomersManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'marketplaces':
        return <MarketplaceIntegration />;
      case 'chat':
        return <ChatWidget />;
      case 'reports':
        return <ReportsManager />;
      case 'analytics':
        return <AnalyticsManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MarketplaceCredentialsProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset className="flex-1">
            <main className="flex-1 overflow-auto p-6">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </MarketplaceCredentialsProvider>
  );
};

export default Index;
