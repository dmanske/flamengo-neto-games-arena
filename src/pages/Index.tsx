
import React from "react";
import { Toaster } from "sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      <Toaster position="top-center" />
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">NETO TOURS</h1>
          <p className="text-xl text-red-200">Caravanas Rubro-Negras</p>
          <div className="mt-8 space-y-4">
            <div>
              <a 
                href="/homepage" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-block"
              >
                Ver Homepage Completa
              </a>
            </div>
            <div>
              <a 
                href="/login" 
                className="bg-black/50 border border-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Área Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
