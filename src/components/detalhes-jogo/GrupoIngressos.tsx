import { Users, Palette, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GrupoIngressos } from '@/types/grupos-ingressos';
import type { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';
import { toast } from 'sonner';
import { useCadastroFacial } from '@/hooks/useCadastroFacial';
import { StatusCadastroFacial } from '@/components/ui/StatusCadastroFacial';

interface GrupoIngressosProps {
  grupo: GrupoIngressos;
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
}

export function GrupoIngressosCard({
  grupo,
  onVerDetalhes,
  onEditar,
  onDeletar
}: GrupoIngressosProps) {
  // Hook para cadastro facial
  const clienteIds = grupo.ingressos.map(i => i.cliente?.id).filter(Boolean) as string[];
  const { 
    cadastroFacialData, 
    loading: loadingCadastroFacial, 
    toggleCadastroFacial 
  } = useCadastroFacial(clienteIds);

  // Função para converter hex para rgba com transparência
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Função para determinar se a cor é clara ou escura
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const backgroundColor = hexToRgba(grupo.cor, 0.05);
  const borderColor = hexToRgba(grupo.cor, 0.3);
  const textColor = isLightColor(grupo.cor) ? '#374151' : grupo.cor;

  // Função para copiar campo
  const copiarCampo = (valor: string, nomeCampo: string) => {
    if (!valor) {
      toast.error(`${nomeCampo} não disponível`);
      return;
    }
    navigator.clipboard.writeText(valor).then(() => {
      toast.success(`${nomeCampo} copiado!`);
    }).catch(() => {
      toast.error(`Erro ao copiar ${nomeCampo.toLowerCase()}`);
    });
  };

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago': return 'default';
      case 'pendente': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago': return '✅ Pago';
      case 'pendente': return '⏳ Pendente';
      case 'cancelado': return '❌ Cancelado';
      default: return status;
    }
  };

  return (
    <div 
      className="mb-6 rounded-lg border-2 overflow-hidden"
      style={{ 
        backgroundColor,
        borderColor,
        borderStyle: 'solid'
      }}
    >
      {/* Cabeçalho do Grupo */}
      <div 
        className="px-4 py-3 border-b"
        style={{ 
          backgroundColor: hexToRgba(grupo.cor, 0.1),
          borderBottomColor: borderColor
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: grupo.cor,
                borderColor: grupo.cor
              }}
            />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: textColor }} />
              <h3 
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {grupo.nome}
              </h3>
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: hexToRgba(grupo.cor, 0.2),
                color: textColor,
                borderColor: grupo.cor
              }}
            >
              {grupo.total_membros} {grupo.total_membros === 1 ? 'ingresso' : 'ingressos'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm" style={{ color: textColor }}>
              <Palette className="h-4 w-4" />
              <span className="font-mono text-xs">{grupo.cor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ingressos do Grupo */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="text-xs text-gray-600">
              <th className="px-4 py-2 text-left font-medium">Cliente</th>
              <th className="px-4 py-2 text-left font-medium">CPF</th>
              <th className="px-4 py-2 text-left font-medium">Nascimento</th>
              <th className="px-4 py-2 text-left font-medium">Contato</th>
              <th className="px-4 py-2 text-left font-medium">Setor</th>
              <th className="px-4 py-2 text-left font-medium">Valor</th>
              <th className="px-4 py-2 text-left font-medium">Lucro</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {grupo.ingressos.map((ingresso) => (
              <tr 
                key={ingresso.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-white/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{ingresso.cliente?.nome || 'N/A'}</span>
                    {ingresso.cliente?.nome && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiarCampo(ingresso.cliente!.nome, 'Nome')}
                        className="h-5 w-5 p-0 hover:bg-blue-100"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {ingresso.cliente?.cpf ? formatCPF(ingresso.cliente.cpf) : '-'}
                      </span>
                      {ingresso.cliente?.cpf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copiarCampo(ingresso.cliente!.cpf!, 'CPF')}
                          className="h-5 w-5 p-0 hover:bg-blue-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {ingresso.cliente?.id && (
                      <StatusCadastroFacial 
                        clienteId={ingresso.cliente.id}
                        cadastroFacialData={cadastroFacialData}
                        loading={loadingCadastroFacial}
                        onClick={toggleCadastroFacial}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatBirthDate(ingresso.cliente?.data_nascimento)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs space-y-1">
                    {ingresso.cliente?.telefone && (
                      <div className="flex items-center gap-1">
                        <span>📱 {formatPhone(ingresso.cliente.telefone)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{ingresso.setor_estadio}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatCurrency(ingresso.valor_final)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(ingresso.lucro)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusBadgeVariant(ingresso.situacao_financeira)} className="text-xs">
                    {getStatusText(ingresso.situacao_financeira)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVerDetalhes(ingresso)}
                      className="h-7 w-7 p-0"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditar(ingresso)}
                      className="h-7 w-7 p-0"
                      title="Editar"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletar(ingresso)}
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                      title="Deletar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé do Grupo */}
      <div 
        className="px-4 py-2 text-xs border-t"
        style={{ 
          backgroundColor: hexToRgba(grupo.cor, 0.05),
          borderTopColor: borderColor,
          color: textColor
        }}
      >
        <div className="flex items-center justify-between">
          <span>
            Grupo: <strong>{grupo.nome}</strong>
          </span>
          <span>
            {grupo.total_membros} ingresso{grupo.total_membros !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
