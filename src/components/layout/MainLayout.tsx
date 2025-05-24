import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Bus, CreditCard, ChevronLeft, ChevronRight, Menu, UserPlus, MessageSquare, Home, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";

// Default logo URL
const DEFAULT_LOGO_URL = "https://logodetimes.com/wp-content/uploads/flamengo.png";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
  exact?: boolean;
  roman?: boolean;
}

const NavItem = ({
  icon,
  title,
  to,
  isActive = false,
  onClick,
  exact = false,
  roman = false
}: NavItemProps & { roman?: boolean }) => {
  return <Link to={to} onClick={onClick} className={cn(
    "flex items-center gap-3 rounded-md px-3 py-2 font-cinzel font-normal not-italic uppercase tracking-normal transition-colors whitespace-nowrap",
    roman && "hover:bg-white/10 hover:text-white/90 focus:bg-white/20 focus:text-white/90",
    isActive ? "bg-white/20 text-white shadow-inner" : "text-white/90"
  )}>
      {icon}
      <span>{title}</span>
    </Link>;
};

// LandingPageLink agora usa o componente Link do React Router em vez de anchor tag
const LandingPageLink = ({
  onClick,
  roman = false
}: {
  onClick?: () => void;
  roman?: boolean;
}) => {
  return (
    <Link 
      to="/site" 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 font-cinzel font-normal not-italic uppercase tracking-normal transition-colors whitespace-nowrap",
        roman && "hover:bg-white/10 hover:text-white/90 focus:bg-white/20 focus:text-white/90 text-white/90"
      )}
    >
      <Home className="h-5 w-5" />
      <span>Site</span>
    </Link>
  );
};

const MainLayout = () => {
  // Set isOpen to false (meaning not collapsed, sidebar is open)
  const {
    isOpen: collapsed,
    setIsOpen: setCollapsed
  } = useSidebar();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
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
  const renderSidebarContent = () => <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-3 flex flex-col items-center justify-center border-b border-rome-gold/30">
        {!collapsed && (
          <span className="font-cinzel text-xl flex flex-col items-center gap-0 tracking-normal whitespace-nowrap justify-center">
            <span className="flex items-end gap-1">
              <span className="text-black font-bold">Neto</span>
              <span className="text-[red] font-bold">Tours</span>
            </span>
            <span className="text-xs text-black font-bold mt-0.5" style={{ letterSpacing: 1 }}>Viagens</span>
          </span>
        )}
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white mt-2 self-center">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>
      {/* Usuário */}
      {!collapsed && (
        <div className="flex items-center gap-3 p-3 border-b border-rome-gold/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rome-terracotta to-rome-terracotta/70 flex items-center justify-center text-white font-cinzel text-lg">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 max-w-xs">
            <span className="text-xs text-white/70 font-inter normal-case break-words max-w-xs leading-tight">Administrador</span>
            <span className="text-xs text-white/70 font-inter normal-case break-words max-w-xs leading-tight">{userProfile}</span>
          </div>
        </div>
      )}
      {/* Navegação */}
      <ScrollArea className="flex-1">
        <div className="py-2 space-y-1 px-3">
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} title="Dashboard" to="/dashboard" onClick={closeMenu} roman />
          <LandingPageLink onClick={closeMenu} roman />
          <NavItem icon={<CalendarDays className="h-5 w-5" />} title="Viagens" to="/dashboard/viagens" onClick={closeMenu} roman />
          <NavItem icon={<Users className="h-5 w-5" />} title="Clientes" to="/dashboard/clientes" onClick={closeMenu} roman />
          <NavItem icon={<UserPlus className="h-5 w-5" />} title="Cadastrar Cliente" to="/dashboard/cadastrar-cliente" onClick={closeMenu} roman />
          <NavItem icon={<Bus className="h-5 w-5" />} title="Ônibus" to="/dashboard/onibus" onClick={closeMenu} roman />
          <NavItem icon={<Store className="h-5 w-5" />} title="Loja" to="/dashboard/loja" onClick={closeMenu} roman />
          <NavItem icon={<CreditCard className="h-5 w-5" />} title="Pagamentos" to="/dashboard/pagamentos" onClick={closeMenu} roman />
          <NavItem icon={<MessageSquare className="h-5 w-5" />} title="WhatsApp" to="/dashboard/whatsapp" onClick={closeMenu} roman />
        </div>
      </ScrollArea>
      {/* Rodapé (Logout) */}
      <div className="border-t border-rome-gold/30 px-2 py-4 mt-2">
        {!collapsed && <LogoutButton />}
      </div>
    </div>;
  return <div className="flex min-h-screen">
      {/* Sidebar para desktop */}
      {!isMobile && <aside className={cn("sidebar-roman bg-gradient-to-b from-rome-navy to-rome-navy/90 text-white border-r border-rome-gold/30 shadow-lg transition-all duration-300 ease-in-out font-inter", collapsed ? "w-16" : "w-64")}> 
          {renderSidebarContent()}
        </aside>}

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        {/* Barra superior para mobile */}
        {isMobile && <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img src="https://logodetimes.com/wp-content/uploads/flamengo.png" alt="Flamengo" className="h-8 w-8" />
                <span className="text-xl font-bold">Neto Tours Viagens</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          </div>}

        {/* Menu lateral mobile */}
        {isMobile && menuOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={closeMenu}>
            <div className="h-full w-64 bg-background" onClick={e => e.stopPropagation()}>
              {renderSidebarContent()}
            </div>
          </div>}

        {/* Conteúdo da página */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default MainLayout;
