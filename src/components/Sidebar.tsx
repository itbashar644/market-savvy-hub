
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
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
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
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          CRM Store
        </h1>
        <p className="text-slate-400 text-sm mt-1">Управление магазином</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-700 mt-auto">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
          <p className="text-sm font-medium">Статус синхронизации</p>
          <p className="text-xs text-green-100 mt-1">Все системы работают</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
