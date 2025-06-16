
import * as React from "react"
import { Package, Users, ShoppingCart, BarChart3, Settings, FileText, Package2, MessageSquare, ExternalLink, Store } from "lucide-react"

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

// Menu items.
const items = [
  {
    title: "Панель управления",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Заказы",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Товары",
    url: "/products",
    icon: Package,
  },
  {
    title: "Остатки",
    url: "/inventory",
    icon: Package2,
  },
  {
    title: "Клиенты",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Аналитика",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Отчеты",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Интеграции",
    url: "/marketplace",
    icon: ExternalLink,
  },
  {
    title: "Чат поддержка",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Настройки",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
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
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
