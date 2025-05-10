import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Bus,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
  exact?: boolean; // Change 'end' to 'exact' which we'll handle manually
}

const NavItem = ({
  icon,
  title,
  to,
  isActive = false,
  onClick,
  exact = false, // Changed from 'end' to 'exact'
}: NavItemProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

const MainLayout = () => {
  const { isOpen: collapsed, setIsOpen: setCollapsed } = useSidebar(); // Fixed property names
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const userProfile = user ? user.email : "Usuário";
  const userInitials = userProfile?.substring(0, 2).toUpperCase();

  const closeMenu = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="https://logodetimes.com/wp-content/uploads/flamengo.png"
              alt="Flamengo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">FlaViagens</span>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="mb-4 mt-2 px-4">
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {userInitials}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="truncate text-sm font-medium">{userProfile}</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 py-2">
          <NavItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Dashboard"
            to="/"
            onClick={closeMenu}
          />
          <NavItem
            icon={<CalendarDays className="h-5 w-5" />}
            title="Viagens"
            to="/viagens"
            onClick={closeMenu}
          />
          <NavItem
            icon={<Users className="h-5 w-5" />}
            title="Clientes"
            to="/clientes"
            onClick={closeMenu}
          />
          <NavItem
            icon={<Users className="h-5 w-5" />}
            title="Passageiros"
            to="/passageiros"
            onClick={closeMenu}
          />
          <NavItem
            icon={<Bus className="h-5 w-5" />}
            title="Ônibus"
            to="/onibus"
            onClick={closeMenu}
          />
          <NavItem
            icon={<CreditCard className="h-5 w-5" />}
            title="Pagamentos"
            to="/pagamentos"
            onClick={closeMenu}
          />
          <NavItem
            icon={<Settings className="h-5 w-5" />}
            title="Configurações"
            to="/configuracoes"
            onClick={closeMenu}
          />
        </div>
      </ScrollArea>

      <div className="border-t px-2 py-2">
        {!collapsed && <LogoutButton />}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar para desktop */}
      {!isMobile && (
        <aside
          className={cn(
            "bg-background border-r transition-all duration-300 ease-in-out",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {renderSidebarContent()}
        </aside>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        {/* Barra superior para mobile */}
        {isMobile && (
          <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img
                  src="https://logodetimes.com/wp-content/uploads/flamengo.png"
                  alt="Flamengo"
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold">FlaViagens</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          </div>
        )}

        {/* Menu lateral mobile */}
        {isMobile && menuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={closeMenu}
          >
            <div
              className="h-full w-64 bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Conteúdo da página */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
