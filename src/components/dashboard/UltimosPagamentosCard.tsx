
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
    <Card className="overflow-hidden border shadow-lg bg-white dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white">
        <CardTitle>Últimos Pagamentos</CardTitle>
        <CardDescription className="text-green-100">
          Transações recentes
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <CreditCard className="h-12 w-12 mb-2 text-muted-foreground/50" />
          <p>Nenhuma transação registrada</p>
          <p className="text-sm">
            As transações aparecerão aqui quando realizadas
          </p>
        </div>
        <Button variant="outline" className="w-full mt-4">
          Ver todos os pagamentos
        </Button>
      </CardContent>
    </Card>
  );
};
