
import React from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  Settings,
  Store,
  TrendingUp,
  Warehouse,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: BarChart3 },
    { id: 'products', label: 'Товары', icon: Package },
    { id: 'orders', label: 'Заказы', icon: ShoppingCart },
    { id: 'customers', label: 'Клиенты', icon: Users },
    { id: 'inventory', label: 'Остатки', icon: Warehouse },
    { id: 'marketplaces', label: 'Маркетплейсы', icon: Store },
    { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
    { id: 'chat', label: 'Чат', icon: MessageSquare },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CRM Store
            </h1>
            <p className="text-sm text-muted-foreground">Управление магазином</p>
          </div>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4 space-y-4">
        <Button 
          onClick={() => signOut()} 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          <span>Выйти</span>
        </Button>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
          <p className="text-sm font-medium text-white">Статус синхронизации</p>
          <p className="text-xs text-green-100 mt-1">Все системы работают</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
