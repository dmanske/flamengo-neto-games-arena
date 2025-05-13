
import React from "react";
import { Link } from "react-router-dom";

const HeaderSection = () => {
  return (
    <header className="bg-black text-white py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold uppercase">Viagem</h1>
        </div>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li><a href="#" className="hover:text-red-500 transition-colors">Home</a></li>
            <li><a href="#next-trips" className="hover:text-red-500 transition-colors">Excursões</a></li>
            <li><a href="#products" className="hover:text-red-500 transition-colors">Produtos</a></li>
            <li><a href="#contact" className="hover:text-red-500 transition-colors">Contato</a></li>
          </ul>
        </nav>
        
        <div className="md:hidden">
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
