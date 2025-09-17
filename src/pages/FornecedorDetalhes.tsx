import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Calendar,
  Loader2,
  AlertTriangle
} from "lucide-react";
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
import { useFornecedores } from "@/hooks/useFornecedores";
import { getFornecedorById } from "@/utils/fornecedorUtils";
import { Fornecedor } from "@/types/fornecedores";
import { getCorTipoFornecedor, getLabelTipoFornecedor } from "@/data/fornecedores";
import { formatarInfoContato } from "@/utils/messageProcessor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const FornecedorDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteFornecedor } = useFornecedores();
  
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


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



  // Abrir WhatsApp
  const handleWhatsApp = () => {
    if (fornecedor?.whatsapp) {
      const telefone = fornecedor.whatsapp.replace(/\D/g, '');
      // Usar mensagem padrão se disponível, senão usar mensagem genérica
      const mensagem = fornecedor.mensagem_padrao || `Olá ${fornecedor.nome}! Aqui é da equipe do Flamengo Viagens. Como posso ajudá-los?`;
      const url = `https://web.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }
  };

  // Abrir email
  const handleEmail = () => {
    if (fornecedor?.email) {
      const assunto = `Contato - Flamengo Viagens`;
      // Usar mensagem padrão se disponível, senão usar mensagem genérica
      const corpo = fornecedor.mensagem_padrao || `Olá ${fornecedor.nome},\n\nEspero que esteja bem!\n\nAtenciosamente,\nFlamengo Viagens`;
      const url = `mailto:${fornecedor.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados do fornecedor...</p>
        </div>
      </div>
    );
  }

  if (error || !fornecedor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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

  const { whatsappFormatado, emailFormatado, telefoneFormatado } = formatarInfoContato(fornecedor);

  // Gerar iniciais para avatar
  const getInitials = (nome: string): string => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-white">
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
              
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback 
                    className={`${getCorTipoFornecedor(fornecedor.tipo_fornecedor)} text-white font-semibold`}
                  >
                    {getInitials(fornecedor.nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {fornecedor.nome}
                  </h1>
                  <Badge 
                    variant="secondary" 
                    className={`${getCorTipoFornecedor(fornecedor.tipo_fornecedor)} text-white text-xs`}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    {getLabelTipoFornecedor(fornecedor.tipo_fornecedor)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link to={`/dashboard/fornecedores/${fornecedor.id}/editar`}>
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações de contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emailFormatado && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{emailFormatado}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmail}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                  </div>
                )}

                {whatsappFormatado && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{whatsappFormatado} (WhatsApp)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWhatsApp}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </Button>
                  </div>
                )}

                {telefoneFormatado && telefoneFormatado !== whatsappFormatado && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{telefoneFormatado}</span>
                  </div>
                )}

                {fornecedor.contato_principal && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">
                      <strong>Contato:</strong> {fornecedor.contato_principal}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endereço */}
            {fornecedor.endereco && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{fornecedor.endereco}</p>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {fornecedor.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {fornecedor.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mensagem Padrão */}
            {fornecedor.mensagem_padrao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagem Padrão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {fornecedor.mensagem_padrao}
                      </p>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(fornecedor.mensagem_padrao!);
                            toast.success('Mensagem copiada para a área de transferência!');
                          } catch (error) {
                            toast.error('Erro ao copiar mensagem');
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                        Copiar
                      </Button>

                      {/* Botão WhatsApp */}
                      {fornecedor.whatsapp && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleWhatsApp}
                          className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          WhatsApp
                        </Button>
                      )}

                      {/* Botão Email */}
                      {fornecedor.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEmail}
                          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar com informações adicionais */}
          <div className="space-y-6">
            {/* Informações gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fornecedor.cnpj && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">CNPJ</span>
                    <p className="text-sm font-medium">{fornecedor.cnpj}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Tipo</span>
                  <p className="text-sm font-medium">
                    {getLabelTipoFornecedor(fornecedor.tipo_fornecedor)}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                  <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                    {fornecedor.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Datas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Cadastrado em</span>
                  <p className="text-sm font-medium">
                    {format(new Date(fornecedor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Última atualização</span>
                  <p className="text-sm font-medium">
                    {format(new Date(fornecedor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>
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
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
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

export default FornecedorDetalhes;