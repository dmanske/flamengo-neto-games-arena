import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PassageiroDisplay {
  id: string;
  nome: string;
  viagem_passageiro_id: string;
  viagem_id?: string; // Added as optional to maintain compatibility
  [key: string]: any;
}

interface PassageiroDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: PassageiroDisplay | null;
  onSuccess: () => void;
}

export function PassageiroDeleteDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
}: PassageiroDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePassageiro = async () => {
    if (!passageiro) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("viagem_passageiros")
        .delete()
        .eq("id", passageiro.viagem_passageiro_id);
      
      if (error) throw error;
      
      toast.success("Passageiro removido com sucesso");
      onOpenChange(false);
      onSuccess();
      
    } catch (err) {
      console.error("Erro ao remover passageiro:", err);
      toast.error("Erro ao remover passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover passageiro</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover este passageiro da viagem?
            {passageiro && (
              <p className="font-medium mt-2">{passageiro.nome}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeletePassageiro}
            className="bg-destructive text-destructive-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
