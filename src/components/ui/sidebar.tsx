import React from "react";
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
import { Home, Users, Calendar, Package, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
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

const Sidebar = () => {
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

export default Sidebar;
