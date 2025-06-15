
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ProductsManager from '@/components/ProductsManager';
import MarketplaceIntegration from '@/components/MarketplaceIntegration';
import ChatWidget from '@/components/ChatWidget';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManager />;
      case 'marketplaces':
        return <MarketplaceIntegration />;
      case 'chat':
        return <ChatWidget />;
      case 'orders':
        return <div className="p-6"><h1 className="text-3xl font-bold">Заказы</h1><p className="text-gray-600 mt-2">Управление заказами в разработке...</p></div>;
      case 'customers':
        return <div className="p-6"><h1 className="text-3xl font-bold">Клиенты</h1><p className="text-gray-600 mt-2">Управление клиентами в разработке...</p></div>;
      case 'inventory':
        return <div className="p-6"><h1 className="text-3xl font-bold">Остатки</h1><p className="text-gray-600 mt-2">Управление остатками в разработке...</p></div>;
      case 'analytics':
        return <div className="p-6"><h1 className="text-3xl font-bold">Аналитика</h1><p className="text-gray-600 mt-2">Расширенная аналитика в разработке...</p></div>;
      case 'reports':
        return <div className="p-6"><h1 className="text-3xl font-bold">Отчеты</h1><p className="text-gray-600 mt-2">Система отчетов в разработке...</p></div>;
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
