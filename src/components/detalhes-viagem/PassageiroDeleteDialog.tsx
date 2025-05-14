
import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PassageiroDeleteDialogProps {
  passageiroId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiroNome: string;
  onSuccess?: () => void;
}

export default function PassageiroDeleteDialog({
  passageiroId,
  open,
  onOpenChange,
  passageiroNome,
  onSuccess,
}: PassageiroDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("viagem_passageiros")
        .delete()
        .eq("id", passageiroId);

      if (error) throw error;

      toast.success(`Passageiro ${passageiroNome} removido com sucesso.`);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao excluir passageiro:", error);
      toast.error(`Erro ao excluir passageiro: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o passageiro {passageiroNome}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { PassageiroDeleteDialog };
