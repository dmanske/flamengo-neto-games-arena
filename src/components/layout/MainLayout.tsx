
import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, Bus, CreditCard, ChevronLeft, ChevronRight, Menu, UserPlus, MessageSquare, Home, Store, Settings, ClipboardList, DollarSign, Calculator, Ticket, Building2 } from "lucide-react";
import LogoEmpresa from "@/components/empresa/LogoEmpresa";
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
        "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 whitespace-nowrap group",
        "hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700",
        isActive ? "bg-blue-100 text-blue-700 shadow-sm border-r-2 border-blue-600" : "text-gray-600 hover:text-blue-700"
      )}
    >
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </Link>
  );
};

// LandingPageLink component
const LandingPageLink = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link 
      to="/site" 
      onClick={onClick} 
      className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 whitespace-nowrap group hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 text-gray-600 hover:text-blue-700"
    >
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        <Home className="h-5 w-5" />
      </div>
      <span className="font-medium">Site</span>
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
    <div className="flex h-full flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Header with Logout */}
      <div className="p-4 flex flex-col items-center justify-center border-b border-gray-200 bg-gray-50/50">
        {/* Logout Button at top */}
        <div className="w-full flex justify-end mb-3">
          <LogoutButton />
        </div>
        
        {!collapsed && (
          <div className="text-center">
            <LogoEmpresa size="sidebar" className="justify-center" />
          </div>
        )}
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 mt-3 self-center"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>
      
      {/* User Profile */}
      {!collapsed && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 max-w-xs">
            <span className="text-sm font-semibold text-gray-900 truncate">Administrador</span>
            <span className="text-xs text-gray-500 truncate">{userProfile}</span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-4 space-y-1 px-3">
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
            icon={<Building2 className="h-5 w-5" />} 
            title="Fornecedores" 
            to="/dashboard/fornecedores" 
            onClick={closeMenu} 
          />

          <NavItem 
            icon={<Bus className="h-5 w-5" />} 
            title="Ônibus" 
            to="/dashboard/onibus" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Ticket className="h-5 w-5" />} 
            title="Ingressos" 
            to="/dashboard/ingressos" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Calculator className="h-5 w-5" />} 
            title="Créditos de Viagem" 
            to="/dashboard/creditos" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Store className="h-5 w-5" />} 
            title="Loja Pública" 
            to="/dashboard/loja" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            title="Admin Loja" 
            to="/dashboard/loja-admin" 
            onClick={closeMenu} 
          />
          <NavItem 
            icon={<DollarSign className="h-5 w-5" />} 
            title="Financeiro" 
            to="/dashboard/financeiro" 
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
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            title="Configurações" 
            to="/dashboard/empresa/configuracoes" 
            onClick={closeMenu} 
          />
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-4 bg-gray-50/30">
        {/* Footer content can be added here if needed */}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        {/* Top bar for mobile */}
        {isMobile && (
          <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-600 hover:bg-gray-100">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <LogoEmpresa size="sm" className="justify-start" />
              </div>
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
        <main className="flex-1 relative bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
