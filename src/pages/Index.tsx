import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Dashboard from "@/components/Dashboard";
import ProductsManager from "@/components/ProductsManager";
import InventoryManager from "@/components/InventoryManager";
import OrdersManager from "@/components/OrdersManager";
import CustomersManager from "@/components/CustomersManager";
import ReportsManager from "@/components/ReportsManager";
import AnalyticsManager from "@/components/AnalyticsManager";
import MarketplaceIntegration from "@/components/MarketplaceIntegration";
import SettingsManager from "@/components/SettingsManager";
import { MarketplaceCredentialsProvider } from "@/hooks/useDatabase";

const Index = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    document.title = "Dashboard | CRM";
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("Index component mounted for user:", user.id);
  }, [user]);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsManager />;
      case "inventory":
        return <InventoryManager />;
      case "orders":
        return <OrdersManager />;
      case "customers":
        return <CustomersManager />;
      case "reports":
        return <ReportsManager />;
      case "analytics":
        return <AnalyticsManager />;
      case "marketplace":
        return <MarketplaceIntegration />;
      case "settings":
        return <SettingsManager />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Загрузка...</h2>
          <p className="text-gray-600">Подождите, идет загрузка приложения</p>
        </div>
      </div>
    );
  }

  return (
    <MarketplaceCredentialsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          <SidebarInset className="flex-1">
            <div className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </MarketplaceCredentialsProvider>
  );
};

export default Index;
