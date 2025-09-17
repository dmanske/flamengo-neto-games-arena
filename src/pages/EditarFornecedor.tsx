import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Loader2, AlertTriangle, Trash2 } from "lucide-react";
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
import { FornecedorForm } from "@/components/fornecedores/FornecedorForm";
import { useFornecedores } from "@/hooks/useFornecedores";
import { getFornecedorById } from "@/utils/fornecedorUtils";
import { Fornecedor, FornecedorFormData } from "@/types/fornecedores";
import { toast } from "sonner";

const EditarFornecedor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateFornecedor, deleteFornecedor } = useFornecedores();
  
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do fornecedor
  useEffect(() => {
    const loadFornecedor = async () => {
      if (!id) {
        setError("ID do fornecedor não encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getFornecedorById(id);
        
        if (data) {
          setFornecedor(data);
        } else {
          setError("Fornecedor não encontrado");
        }
      } catch (err: any) {
        console.error("Erro ao carregar fornecedor:", err);
        setError("Erro ao carregar dados do fornecedor");
      } finally {
        setLoading(false);
      }
    };

    loadFornecedor();
  }, [id]); // Removido getFornecedorById das dependências

  const handleSubmit = async (data: FornecedorFormData) => {
    if (!fornecedor) return;

    try {
      setIsSubmitting(true);
      console.log("Atualizando fornecedor:", data);

      const fornecedorAtualizado = await updateFornecedor(fornecedor.id, data);
      
      if (fornecedorAtualizado) {
        setFornecedor(fornecedorAtualizado);
        navigate("/dashboard/fornecedores", { 
          replace: true,
          state: { 
            message: `Fornecedor ${fornecedorAtualizado.nome} atualizado com sucesso!`,
            fornecedorId: fornecedorAtualizado.id
          }
        });
      }
    } catch (error: any) {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error("Erro ao atualizar fornecedor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!fornecedor) return;

    try {
      setIsDeleting(true);
      const success = await deleteFornecedor(fornecedor.id);
      
      if (success) {
        navigate("/dashboard/fornecedores", { 
          replace: true,
          state: { 
            message: `Fornecedor ${fornecedor.nome} removido com sucesso!`
          }
        });
      }
    } catch (error: any) {
      console.error("Erro ao excluir fornecedor:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados do fornecedor...</p>
        </div>
      </div>
    );
  }

  if (error || !fornecedor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Fornecedor não encontrado"}
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do fornecedor.
          </p>
          <Button asChild>
            <Link to="/dashboard/fornecedores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/dashboard/fornecedores">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Editar Fornecedor
                </h1>
                <p className="text-sm text-gray-500">
                  {fornecedor.nome}
                </p>
              </div>
            </div>

            {/* Botão de excluir */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Card de informações */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-900 flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Editando fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-amber-800">
                Você está editando os dados do fornecedor <strong>{fornecedor.nome}</strong>. 
                As alterações serão salvas imediatamente após confirmar.
              </p>
            </CardContent>
          </Card>

          {/* Formulário */}
          <FornecedorForm
            fornecedor={fornecedor}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Salvar Alterações"
          />

          {/* Botões de navegação */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              asChild
              disabled={isSubmitting}
            >
              <Link to="/dashboard/fornecedores">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Link>
            </Button>

            <div className="text-sm text-gray-500">
              Última atualização: {new Date(fornecedor.updated_at).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor <strong>{fornecedor.nome}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Informações de contato</li>
                <li>Histórico de comunicações</li>
                <li>Templates de mensagens associados</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
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
                'Excluir Fornecedor'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditarFornecedor;