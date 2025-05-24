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

// Professional logo URL
const DEFAULT_LOGO_URL = "https://logodetimes.com/wp-content/uploads/flamengo.png";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
  exact?: boolean;
}

const NavItem = ({
  icon,
  title,
  to,
  isActive = false,
  onClick,
  exact = false
}: NavItemProps) => {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-300 whitespace-nowrap group",
        "hover:bg-white/10 hover:text-white/90 focus:bg-white/20 focus:text-white/90",
        isActive ? "bg-white/20 text-white shadow-lg border border-white/20" : "text-white/80 hover:text-white"
      )}
    >
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="font-semibold">{title}</span>
    </Link>
  );
};

// LandingPageLink component
const LandingPageLink = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link 
      to="/site" 
      onClick={onClick} 
      className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-300 whitespace-nowrap group hover:bg-white/10 hover:text-white/90 focus:bg-white/20 focus:text-white/90 text-white/80 hover:text-white"
    >
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        <Home className="h-5 w-5" />
      </div>
      <span className="font-semibold">Site</span>
    </Link>
  );
};

const MainLayout = () => {
  const {
    isOpen: collapsed,
    setIsOpen: setCollapsed
  } = useSidebar();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
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
  
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-950/95 backdrop-blur-md border-r border-slate-700/50">
      {/* Professional Header */}
      <div className="p-4 flex flex-col items-center justify-center border-b border-slate-700/50 bg-slate-950/50">
        {!collapsed && (
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
              <img src={DEFAULT_LOGO_URL} alt="Flamengo" className="w-8 h-8" />
            </div>
            <div className="font-bold text-white">
              <span className="text-lg">Neto Tours</span>
              <div className="text-xs text-blue-200 mt-1">Sistema de Gestão</div>
            </div>
          </div>
        )}
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-2 rounded-full hover:bg-slate-800/50 transition-colors text-white/80 hover:text-white mt-3 self-center"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>
      
      {/* Professional User Profile */}
      {!collapsed && (
        <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-slate-950/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 max-w-xs">
            <span className="text-sm font-semibold text-white truncate">Administrador</span>
            <span className="text-xs text-slate-400 truncate">{userProfile}</span>
          </div>
        </div>
      )}
      
      {/* Professional Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-4 space-y-2 px-3">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            title="Dashboard" 
            to="/dashboard" 
            onClick={closeMenu} 
          />
          <LandingPageLink onClick={closeMenu} />
          <NavItem 
            icon={<CalendarDays className="h-5 w-5" />} 
            title="Viagens" 
            to="/dashboard/viagens" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Users className="h-5 w-5" />} 
            title="Clientes" 
            to="/dashboard/clientes" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<UserPlus className="h-5 w-5" />} 
            title="Cadastrar Cliente" 
            to="/dashboard/cadastrar-cliente" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Bus className="h-5 w-5" />} 
            title="Ônibus" 
            to="/dashboard/onibus" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Store className="h-5 w-5" />} 
            title="Loja" 
            to="/dashboard/loja" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<CreditCard className="h-5 w-5" />} 
            title="Pagamentos" 
            to="/dashboard/pagamentos" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<MessageSquare className="h-5 w-5" />} 
            title="WhatsApp" 
            to="/dashboard/whatsapp" 
            onClick={closeMenu} 
          />
        </div>
      </ScrollArea>
      
      {/* Professional Footer (Logout) */}
      <div className="border-t border-slate-700/50 px-3 py-4 bg-slate-950/50">
        {!collapsed && <LogoutButton />}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className={cn(
          "transition-all duration-300 ease-in-out relative",
          collapsed ? "w-16" : "w-64"
        )}> 
          {renderSidebarContent()}
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Professional Top bar for mobile */}
        {isMobile && (
          <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white hover:bg-slate-800/50">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                  <img src={DEFAULT_LOGO_URL} alt="Flamengo" className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white">Neto Tours</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          </div>
        )}

        {/* Mobile menu overlay */}
        {isMobile && menuOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm" onClick={closeMenu}>
            <div className="h-full w-64" onClick={e => e.stopPropagation()}>
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
