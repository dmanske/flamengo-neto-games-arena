
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Sample product data (to be replaced with API data later)
const products = [
  {
    id: 1,
    name: "Camisa Oficial Flamengo 2023",
    price: 349.90,
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c5d6cefd42af494d9d31afc700f6cbf2_9366/Camisa_1_CR_Flamengo_22-23_Vermelho_H68994_01_laydown.jpg"
  },
  {
    id: 2,
    name: "Boné Flamengo Oficial",
    price: 129.90,
    image: "https://static.netshoes.com.br/produtos/bone-new-era-3930-flamengo-core-team/26/D19-1562-026/D19-1562-026_zoom1.jpg"
  },
  {
    id: 3,
    name: "Cachecol Flamengo",
    price: 89.90,
    image: "https://static.netshoes.com.br/produtos/cachecol-flamengo-tradicional/06/D66-1452-006/D66-1452-006_zoom1.jpg"
  },
  {
    id: 4,
    name: "Mochila Flamengo",
    price: 149.90,
    image: "https://static.netshoes.com.br/produtos/mochila-flamengo-esporte/26/D66-1538-026/D66-1538-026_zoom1.jpg"
  }
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 uppercase">Produtos Oficiais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-red-700 rounded-lg overflow-hidden">
              <div className="h-64 bg-white flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-4 text-white">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <div className="text-2xl font-bold mb-4">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
                <Button 
                  className="bg-black hover:bg-gray-900 text-white w-full uppercase font-bold"
                >
                  Comprar
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/dashboard/loja">
            <Button 
              className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg uppercase font-bold"
            >
              Ver Todos os Produtos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
