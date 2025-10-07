import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const navLinks = [{
    name: "Início",
    href: "#home",
    isRoute: false
  }, {
    name: "Sobre",
    href: "#about",
    isRoute: false
  }, {
    name: "Galeria",
    href: "/galeria",
    isRoute: true
  }, {
    name: "Ônibus",
    href: "#buses",
    isRoute: false
  }, {
    name: "Ingressos",
    href: "#ticket-info",
    isRoute: false
  }, {
    name: "Próximas Viagens",
    href: "#upcoming-trips",
    isRoute: false
  }, {
    name: "Passeios",
    href: "#tours",
    isRoute: false
  }, {
    name: "Depoimentos",
    href: "#testimonials",
    isRoute: false
  }, {
    name: "Contato",
    href: "#contact",
    isRoute: false
  }];
  return <footer className="bg-black text-white border-t border-gray-900 relative">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold text-gradient mb-4">
              Caravana Mengão
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              A maior caravana do Flamengo levando paixão aos estádios há mais de 10 anos.
              Junte-se a nós e viva a emoção de cada jogo!
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.instagram.com/neto.viagens/?igsh=MWRkODhvbjh3dW1lbg3D3D" target="_blank" rel="noopener noreferrer" className="group" aria-label="@neto.viagens">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-pink-500/50">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="group">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-red-500/50">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {navLinks.map(link => <li key={link.href}>
                  {link.isRoute ? (
                    <Link to={link.href} className="text-gray-400 hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">
                      {link.name}
                    </Link>
                  ) : (
                    <a 
                      href={`/${link.href}`}
                      className="text-gray-400 hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
                      onClick={(e) => {
                        // Se já estiver na página principal, previne reload e faz scroll suave
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const element = document.querySelector(link.href);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      {link.name}
                    </a>
                  )}
                </li>)}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(47) 99992-1907</span>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">comandocatarinense@hotmail.com</span>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Rua Antônio Essig, 114 - Itoupava Norte - Blumenau/SC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-900 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Neto Tours Viagens -  Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido com ❤️ para a Nação Rubro-Negra</p>
        </div>
      </div>

      {/* Botão Voltar ao Topo */}
      <Button onClick={scrollToTop} size="icon" className="fixed bottom-24 right-6 w-12 h-12 bg-primary rounded-full shadow-glow hover:scale-110 transition-transform z-40" aria-label="Voltar ao topo">
        <ArrowUp className="h-6 w-6 text-white" />
      </Button>
    </footer>;
};
export default Footer;