
import React from "react";
import { LogoSettings } from "@/components/configuracoes/LogoSettings";

const Configuracoes = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <div className="grid gap-6">
        <LogoSettings />
      </div>
    </div>
  );
};

export default Configuracoes;
