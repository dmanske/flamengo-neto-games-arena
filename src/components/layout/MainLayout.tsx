
import React from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Bus, Calendar, CreditCard, Map, Settings, User, Users } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {
  const menuItems = [
    {
      title: "Dashboard",
      icon: Map,
      path: "/"
    },
    {
      title: "Cadastrar Cliente",
      icon: User,
      path: "/cadastrar-cliente"
    },
    {
      title: "Clientes Cadastrados",
      icon: Users,
      path: "/clientes"
    },
    {
      title: "Viagens",
      icon: Calendar,
      path: "/viagens"
    },
    {
      title: "Ônibus",
      icon: Bus,
      path: "/onibus"
    },
    {
      title: "Pagamentos",
      icon: CreditCard,
      path: "/pagamentos"
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/configuracoes"
    }
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar>
        <SidebarContent>
          <div className="p-4 flex items-center justify-center">
            <h1 className="text-xl font-bold text-primary">Caravanas Flamengo</h1>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
