import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  MessageSquare,
  Building2,
  User
} from 'lucide-react';
import { Fornecedor } from '@/types/fornecedores';
import { getCorTipoFornecedor, getLabelTipoFornecedor } from '@/data/fornecedores';
import { formatarInfoContato } from '@/utils/messageProcessor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface FornecedorCardProps {
  fornecedor: Fornecedor;
  onEdit?: (fornecedor: Fornecedor) => void;
  onDelete?: (fornecedor: Fornecedor) => void;
}

export const FornecedorCard = ({
  fornecedor,
  onEdit,
  onDelete
}: FornecedorCardProps) => {
  // Formatar informações de contato
  const { whatsappFormatado, emailFormatado, telefoneFormatado } = formatarInfoContato(fornecedor);

  // Calcular tempo desde criação
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Agora' : `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else {
        return format(date, "dd/MM", { locale: ptBR });
      }
    }
  };

  // Gerar iniciais para avatar
  const getInitials = (nome: string): string => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Abrir WhatsApp
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fornecedor.whatsapp) {
      const telefone = fornecedor.whatsapp.replace(/\D/g, '');
      // Usar mensagem padrão se disponível, senão usar mensagem genérica
      const mensagem = fornecedor.mensagem_padrao || `Olá ${fornecedor.nome}! Aqui é da equipe do Flamengo Viagens. Como posso ajudá-los?`;
      const url = `https://web.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }
  };

  // Abrir email
  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fornecedor.email) {
      const assunto = `Contato - Flamengo Viagens`;
      // Usar mensagem padrão se disponível, senão usar mensagem genérica
      const corpo = fornecedor.mensagem_padrao || `Olá ${fornecedor.nome},\n\nEspero que esteja bem!\n\nAtenciosamente,\nFlamengo Viagens`;
      const url = `mailto:${fornecedor.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarFallback 
                className={`${getCorTipoFornecedor(fornecedor.tipo_fornecedor)} text-white font-semibold text-lg`}
              >
                {getInitials(fornecedor.nome)}
              </AvatarFallback>
            </Avatar>
            {/* Indicador de status ativo */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Conteúdo principal - Clicável */}
          <Link 
            to={`/dashboard/fornecedores/${fornecedor.id}`} 
            className="flex-1 min-w-0 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {fornecedor.nome}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeAgo(fornecedor.created_at)}
                </span>
              </div>
            </div>

            {/* Tipo de fornecedor */}
            <div className="mb-2">
              <Badge 
                variant="secondary" 
                className={`${getCorTipoFornecedor(fornecedor.tipo_fornecedor)} text-white text-xs`}
              >
                <Building2 className="h-3 w-3 mr-1" />
                {getLabelTipoFornecedor(fornecedor.tipo_fornecedor)}
              </Badge>
            </div>

            {/* Informações de contato */}
            <div className="space-y-1">
              {/* WhatsApp/Telefone */}
              {(whatsappFormatado || telefoneFormatado) && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2 text-green-600" />
                    <span>{whatsappFormatado || telefoneFormatado}</span>
                  </div>
                  {/* Botão WhatsApp */}
                  {fornecedor.whatsapp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-50 text-green-600 ml-2"
                      onClick={handleWhatsApp}
                      title="Enviar WhatsApp"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </Button>
                  )}
                </div>
              )}

              {/* Email */}
              {emailFormatado && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2 text-blue-600" />
                    <span className="truncate">{emailFormatado}</span>
                  </div>
                  {/* Botão Email */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-blue-50 text-blue-600 ml-2"
                    onClick={handleEmail}
                    title="Enviar Email"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Contato Principal */}
              {fornecedor.contato_principal && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-3 w-3 mr-2 text-purple-600" />
                  <span>{fornecedor.contato_principal}</span>
                </div>
              )}

              {/* Endereço */}
              {fornecedor.endereco && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-2 text-orange-600" />
                  <span className="truncate">{fornecedor.endereco}</span>
                </div>
              )}
            </div>
          </Link>

          {/* Botões de ação - posicionados absolutamente */}
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(fornecedor);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                

                
                {onDelete && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(fornecedor);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};