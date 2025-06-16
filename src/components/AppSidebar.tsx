
import * as React from "react"
import { Package, Users, ShoppingCart, BarChart3, Settings, FileText, Package2, MessageSquare, ExternalLink, Store, LogOut } from "lucide-react"
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"

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
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu items with keys that match the routing logic
const items = [
  {
    title: "Панель управления",
    key: "dashboard",
    icon: BarChart3,
  },
  {
    title: "Заказы",
    key: "orders",
    icon: ShoppingCart,
  },
  {
    title: "Товары",
    key: "products",
    icon: Package,
  },
  {
    title: "Остатки",
    key: "inventory",
    icon: Package2,
  },
  {
    title: "Клиенты",
    key: "customers",
    icon: Users,
  },
  {
    title: "Аналитика",
    key: "analytics",
    icon: BarChart3,
  },
  {
    title: "Отчеты",
    key: "reports",
    icon: FileText,
  },
  {
    title: "Интеграции",
    key: "marketplaces",
    icon: ExternalLink,
  },
  {
    title: "Чат поддержка",
    key: "chat",
    icon: MessageSquare,
  },
  {
    title: "Настройки",
    key: "settings",
    icon: Settings,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  const { signOut } = useAuth();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="bg-sidebar">
        <div className="flex items-center gap-2 px-4 py-2">
          <Store className="h-6 w-6 text-sidebar-foreground" />
          <span className="text-lg font-semibold text-sidebar-foreground">CRM Store</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Управление</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.key)}
                    isActive={activeTab === item.key}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => signOut()}
              tooltip="Выйти"
            >
              <LogOut />
              <span>Выйти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
