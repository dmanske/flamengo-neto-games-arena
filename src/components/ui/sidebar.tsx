import React, { createContext, useContext, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, Package, Settings, Bus, Car, UserCheck, MessagesSquare, CreditCard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Create context for sidebar state
type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component - set default to false (not collapsed)
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Sidebar components
export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return <aside className="w-64 min-h-screen border-r !bg-rome-navy !text-rome-gold !border-rome-gold/30 sidebar">{children}</aside>;
};

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="py-4">{children}</div>;
};

export const SidebarGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-3 py-2">{children}</div>;
};

export const SidebarGroupLabel = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight">{children}</h3>;
};

export const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-1">{children}</div>;
};

export const SidebarMenu = ({ children }: { children: React.ReactNode }) => {
  return <nav className="flex flex-col gap-1">{children}</nav>;
};

export const SidebarMenuItem = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const SidebarMenuButton = ({ 
  children,
  asChild = false,
  ...props
}: { 
  children: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const Comp = asChild ? React.Fragment : 'div';
  return (
    <Comp {...props} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${props.className || ''}`}>
      {children}
    </Comp>
  );
};

// Original Sidebar implementation
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;  // Changed from ComponentType<any> to ElementType
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Passageiros",
    href: "/passageiros",
    icon: Users,
  },
  {
    name: "Viagens",
    href: "/viagens",
    icon: Calendar,
  },
  {
    name: "Ônibus",
    href: "/onibus",
    icon: Package,
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

const SidebarComponent = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegue pelas opções do sistema.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <Link to={item.href} className="w-full">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarComponent;

// Remove the duplicate Sidebar declaration and replace with SidebarNav
export function SidebarNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      title: "Clientes",
      icon: <Users className="h-4 w-4" />,
      path: "/dashboard/clientes",
    },
    {
      title: "Viagens",
      icon: <Bus className="h-4 w-4" />,
      path: "/dashboard/viagens",
    },
    {
      title: "Ônibus",
      icon: <Car className="h-4 w-4" />,
      path: "/dashboard/onibus",
    },
    {
      title: "Passageiros",
      icon: <UserCheck className="h-4 w-4" />,
      path: "/dashboard/passageiros",
    },
    {
      title: "WhatsApp",
      icon: <MessagesSquare className="h-4 w-4" />,
      path: "/dashboard/whatsapp",
    },
    {
      title: "Pagamentos",
      icon: <CreditCard className="h-4 w-4" />,
      path: "/dashboard/pagamentos",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Home className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegue pelas opções do sistema.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <Link to={item.path} className="w-full">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {item.icon}
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </SheetContent>
    </Sheet>
  );
}
