
import * as React from "react"
import { Package, Users, ShoppingCart, BarChart3, Settings, FileText, Package2, MessageSquare, ExternalLink, LogOut } from "lucide-react"
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

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
  SidebarTrigger,
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

const SidebarContent = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const { signOut } = useAuth();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium text-xs uppercase tracking-wider px-4">
          Управление
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1 px-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => onTabChange(item.key)}
                  isActive={activeTab === item.key}
                  tooltip={item.title}
                  className={`sidebar-menu-button-modern ${
                    activeTab === item.key ? 'sidebar-menu-button-active' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarMenu className="mt-auto p-4">
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => signOut()}
            tooltip="Выйти"
            className="sidebar-menu-button-modern text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Выйти</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};

const MobileSidebar = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const [open, setOpen] = React.useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false); // Закрываем сайдбар после выбора
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <SidebarTrigger />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">CRM Store</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-auto px-4 pb-4">
          <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />;
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="sidebar-modern" {...props}>
      <SidebarHeader className="flex flex-row items-center justify-between p-4">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
