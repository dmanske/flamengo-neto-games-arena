import React from "react";
import { cn } from "@/lib/utils";

interface SetorBadgeProps {
  setor: string;
  className?: string;
}

/**
 * Componente para exibir setores com cores específicas
 * Cores definidas conforme solicitação:
 * - Norte → Verde
 * - Oeste → Claro (cinza claro)
 * - Sul → Amarelo
 * - Leste Superior → Marrom
 * - Leste Inferior → Vermelho
 * - Maracanã Mais → Azul Escuro
 * - Sem Ingresso → Vermelho
 */
export const SetorBadge = ({ setor, className }: SetorBadgeProps) => {
  const getSetorStyle = (setor: string) => {
    const setorLower = setor.toLowerCase();
    
    switch (setorLower) {
      case "norte":
        return "bg-green-100 text-green-800 border-green-200";
      
      case "oeste":
        return "bg-blue-900 text-white border-blue-900";
      
      case "sul":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      
      case "leste superior":
        return "bg-amber-100 text-amber-800 border-amber-200";
      
      case "leste inferior":
        return "bg-red-100 text-red-800 border-red-200";
      
      case "maracanã mais":
        return "bg-blue-900 text-white border-blue-900";
      
      case "sem ingresso":
        return "bg-red-100 text-red-800 border-red-200";
      
      // Setores para jogos fora do Rio
      case "setor casa":
        return "bg-blue-100 text-blue-800 border-blue-200";
      
      case "setor visitante":
        return "bg-purple-100 text-purple-800 border-purple-200";
      
      // Outros setores (fallback)
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
        getSetorStyle(setor),
        className
      )}
    >
      {setor}
    </span>
  );
};