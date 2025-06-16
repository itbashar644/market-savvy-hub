
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
import { cn } from '@/lib/utils';
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
    <Sidebar className="border-r-0 bg-slate-900 text-white">
      <SidebarHeader className="border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CRM Store
            </h1>
            <p className="text-slate-400 text-sm mt-1">Управление магазином</p>
          </div>
          <SidebarTrigger className="md:hidden text-white hover:bg-slate-800" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 px-6 py-4">Навигация</SidebarGroupLabel>
          <SidebarGroupContent className="px-4">
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left hover:bg-slate-800",
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg text-white"
                          : "text-slate-300 hover:text-white"
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-slate-700 p-4 bg-slate-900 space-y-4">
        <Button 
          onClick={() => signOut()} 
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white border-0"
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
