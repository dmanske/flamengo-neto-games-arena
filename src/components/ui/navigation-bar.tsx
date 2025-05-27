
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Video, Store, Calendar } from "lucide-react";

export const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "#home", label: "Início", icon: null },
    { href: "/loja", label: "Loja", icon: <Store className="w-4 h-4" /> },
    { href: "#viagens", label: "Próximas Viagens", icon: <Calendar className="w-4 h-4" /> },
    { href: "/galeria-fotos", label: "Galeria de Fotos", icon: <Camera className="w-4 h-4" /> },
    { href: "/galeria-videos", label: "Galeria de Vídeos", icon: <Video className="w-4 h-4" /> },
    { href: "#contato", label: "Contato", icon: null },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">NT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-xl">
                Neto Tours
              </h1>
              <p className="text-red-300 text-xs">Caravanas Rubro-Negras</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item, index) => (
              item.href.startsWith('/') ? (
                <Link
                  key={index}
                  to={item.href}
                  className="flex items-center gap-2 text-red-100 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-2 text-red-100 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item.icon}
                  {item.label}
                </a>
              )
            ))}
            
            <Link to="/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Área Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-red-500/20">
            <div className="px-4 py-6 space-y-3">
              {menuItems.map((item, index) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={index}
                    to={item.href}
                    className="flex items-center gap-3 text-red-100 hover:text-white transition-colors px-3 py-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 text-red-100 hover:text-white transition-colors px-3 py-3 rounded-lg hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                )
              ))}
              
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
                  Área Admin
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
