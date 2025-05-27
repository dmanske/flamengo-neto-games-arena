
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ContadorCarrinhoProps {
  onClick: () => void;
}

export const ContadorCarrinho = ({ onClick }: ContadorCarrinhoProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const carrinhoSalvo = localStorage.getItem('carrinho-neto-tours');
      if (carrinhoSalvo) {
        const itens = JSON.parse(carrinhoSalvo);
        const totalItens = itens.reduce((acc: number, item: any) => acc + item.quantidade, 0);
        setCount(totalItens);
      } else {
        setCount(0);
      }
    };

    // Atualizar na inicialização
    updateCount();

    // Escutar eventos de atualização do carrinho
    window.addEventListener('carrinho-atualizado', updateCount);
    
    return () => {
      window.removeEventListener('carrinho-atualizado', updateCount);
    };
  }, []);

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="relative border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
};
