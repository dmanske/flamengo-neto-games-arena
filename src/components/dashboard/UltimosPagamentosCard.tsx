
import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export const UltimosPaymentsCard = () => {
  return (
    <GlassCard variant="elevated" className="max-w-xs">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center rounded-t-xl mb-4">
        <h3 className="text-lg font-semibold tracking-wide drop-shadow-sm m-0 text-white">
          Últimos Pagamentos
        </h3>
      </div>
      <div className="p-6 pt-2">
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-600">
          <CreditCard className="h-12 w-12 mb-2 text-gray-400" />
          <p className="font-medium">Nenhuma transação registrada</p>
          <p className="text-sm text-gray-500 mt-1">
            As transações aparecerão aqui quando realizadas
          </p>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg text-white mt-4 shadow-professional">
          Ver todos os pagamentos
        </Button>
      </div>
    </GlassCard>
  );
};
