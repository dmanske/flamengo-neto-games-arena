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
    <Card className="roman-card overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-red-600 via-red-800 to-black text-rome-navy p-4 flex justify-between items-center rounded-t-xl mb-4">
        <h3 className="text-lg font-cinzel tracking-wide drop-shadow-sm m-0 text-white">Últimos Pagamentos</h3>
      </div>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <CreditCard className="h-12 w-12 mb-2 text-muted-foreground/50" />
          <p>Nenhuma transação registrada</p>
          <p className="text-sm">
            As transações aparecerão aqui quando realizadas
          </p>
        </div>
        <Button className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg text-white mt-4">
          Ver todos os pagamentos
        </Button>
      </CardContent>
    </Card>
  );
};
