
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ProductsManager from '@/components/ProductsManager';
import MarketplaceIntegration from '@/components/MarketplaceIntegration';
import ChatWidget from '@/components/ChatWidget';
import OrdersManager from '@/components/OrdersManager';
import CustomersManager from '@/components/CustomersManager';
import InventoryManager from '@/components/InventoryManager';
import ReportsManager from '@/components/ReportsManager';
import AnalyticsManager from '@/components/AnalyticsManager';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
        return <div className="p-6"><h1 className="text-3xl font-bold">Настройки</h1><p className="text-gray-600 mt-2">Настройки системы в разработке...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
