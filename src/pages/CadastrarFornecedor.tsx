import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, CheckCircle } from "lucide-react";
import { FornecedorForm } from "@/components/fornecedores/FornecedorForm";
import { useFornecedores } from "@/hooks/useFornecedores";
import { FornecedorFormData } from "@/types/fornecedores";
import { toast } from "sonner";

const CadastrarFornecedor = () => {
  const navigate = useNavigate();
  const { createFornecedor } = useFornecedores();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FornecedorFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Cadastrando fornecedor:", data);

      const novoFornecedor = await createFornecedor(data);
      
      if (novoFornecedor) {
        // Navegar para a página de detalhes do fornecedor ou lista
        navigate("/dashboard/fornecedores", { 
          replace: true,
          state: { 
            message: `Fornecedor ${novoFornecedor.nome} cadastrado com sucesso!`,
            fornecedorId: novoFornecedor.id
          }
        });
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar fornecedor:", error);
      toast.error("Erro ao cadastrar fornecedor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                Cadastrar Fornecedor
              </h1>
              <p className="text-sm text-gray-500">
                Adicione um novo fornecedor ao sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Card de instruções */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900 flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4" />
                Informações importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Preencha pelo menos o nome e tipo do fornecedor</li>
                <li>• Adicione WhatsApp para facilitar a comunicação</li>
                <li>• O email é importante para envio de mensagens formais</li>
                <li>• Use o campo observações para informações especiais</li>
              </ul>
            </CardContent>
          </Card>

          {/* Formulário */}
          <FornecedorForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Cadastrar Fornecedor"
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
              Após cadastrar, você poderá criar templates de mensagens personalizadas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastrarFornecedor;