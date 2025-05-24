
import React from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const UltimosPaymentsCard = () => {
  return (
    <Card className="bg-white rounded-xl shadow-professional border border-gray-100 hover:shadow-professional-md transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4 flex justify-between items-center rounded-t-xl mb-4">
        <h3 className="text-lg font-semibold tracking-wide drop-shadow-sm m-0 text-white">Últimos Pagamentos</h3>
      </div>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-600">
          <CreditCard className="h-12 w-12 mb-2 text-gray-400" />
          <p>Nenhuma transação registrada</p>
          <p className="text-sm">
            As transações aparecerão aqui quando realizadas
          </p>
        </div>
        <Button className="w-full bg-slate-600 hover:bg-slate-700 py-6 text-lg text-white mt-4 shadow-professional">
          Ver todos os pagamentos
        </Button>
      </CardContent>
    </Card>
  );
};
