import { Users, Palette, Eye, Edit, Trash2, Copy, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GrupoIngressos } from '@/types/grupos-ingressos';
import type { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone, formatBirthDate } from '@/utils/formatters';
import { toast } from 'sonner';
import { useCadastroFacial } from '@/hooks/useCadastroFacial';
import { StatusCadastroFacial } from '@/components/ui/StatusCadastroFacial';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  // Ref para capturar o elemento para exportação
  const exportRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Estado local para a cor (para atualização imediata na UI)
  const [corAtual, setCorAtual] = useState(grupo.cor);
  
  // Hook para cadastro facial
  const clienteIds = grupo.ingressos.map(i => i.cliente?.id).filter(Boolean) as string[];
  const { 
    cadastroFacialData, 
    loading: loadingCadastroFacial, 
    toggleCadastroFacial 
  } = useCadastroFacial(clienteIds);

  // Função para atualizar cor do grupo
  const atualizarCorGrupo = async (novaCor: string) => {
    try {
      setCorAtual(novaCor);
      
      // Atualizar todos os ingressos do grupo
      const { error } = await supabase
        .from('ingressos')
        .update({ grupo_cor: novaCor })
        .eq('grupo_nome', grupo.nome)
        .eq('grupo_cor', grupo.cor);

      if (error) throw error;

      toast.success('Cor do grupo atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar cor do grupo:', error);
      toast.error('Erro ao atualizar cor do grupo');
      setCorAtual(grupo.cor); // Reverter em caso de erro
    }
  };

  // Função para abrir o color picker
  const abrirColorPicker = () => {
    colorInputRef.current?.click();
  };

  // Função para exportar como imagem
  const exportarComoImagem = async () => {
    if (!exportRef.current) return;

    const toastId = toast.loading('Gerando imagem...');
    
    try {
      // Captura o elemento
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Melhor qualidade
        logging: false,
        useCORS: true
      });

      // Converte para blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Erro ao gerar imagem', { id: toastId });
          return;
        }

        // Cria URL temporária
        const url = URL.createObjectURL(blob);
        
        // Cria link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `grupo-${grupo.nome.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpa URL temporária
        URL.revokeObjectURL(url);
        
        toast.success('Imagem gerada com sucesso!', { id: toastId });
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      toast.error('Erro ao gerar imagem', { id: toastId });
    }
  };

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

  const backgroundColor = hexToRgba(corAtual, 0.05);
  const borderColor = hexToRgba(corAtual, 0.3);
  const textColor = isLightColor(corAtual) ? '#374151' : corAtual;

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
    <>
      {/* Input de cor oculto */}
      <input
        ref={colorInputRef}
        type="color"
        value={corAtual}
        onChange={(e) => atualizarCorGrupo(e.target.value)}
        className="hidden"
      />

      {/* Versão visível normal */}
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
            backgroundColor: hexToRgba(corAtual, 0.1),
            borderBottomColor: borderColor
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={abrirColorPicker}
                className="w-4 h-4 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: corAtual,
                  borderColor: corAtual
                }}
                title="Clique para trocar a cor do grupo"
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
                  backgroundColor: hexToRgba(corAtual, 0.2),
                  color: textColor,
                  borderColor: corAtual
                }}
              >
                {grupo.total_membros} {grupo.total_membros === 1 ? 'ingresso' : 'ingressos'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportarComoImagem}
                className="h-8 gap-2"
                title="Exportar para WhatsApp"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs">Exportar para WhatsApp</span>
              </Button>
              <div className="flex items-center gap-1 text-sm" style={{ color: textColor }}>
                <Palette className="h-4 w-4" />
                <span className="font-mono text-xs">{corAtual}</span>
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
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Lucro</th>
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
                  <Badge variant={getStatusBadgeVariant(ingresso.situacao_financeira)} className="text-xs">
                    {getStatusText(ingresso.situacao_financeira)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(ingresso.lucro)}
                  </span>
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

    {/* Versão oculta para exportação (sem lucro e sem ações) */}
    <div 
      ref={exportRef}
      className="fixed -left-[9999px] top-0 w-[800px] rounded-lg border-2 overflow-hidden bg-white"
      style={{ 
        backgroundColor: '#ffffff',
        borderColor,
        borderStyle: 'solid'
      }}
    >
      {/* Cabeçalho do Grupo */}
      <div 
        className="px-6 py-4 border-b"
        style={{ 
          backgroundColor: hexToRgba(corAtual, 0.1),
          borderBottomColor: borderColor
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full border-2"
            style={{ 
              backgroundColor: corAtual,
              borderColor: corAtual
            }}
          />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: textColor }} />
            <h3 
              className="text-lg font-bold"
              style={{ color: textColor }}
            >
              {grupo.nome}
            </h3>
          </div>
          <span 
            className="text-sm font-semibold"
            style={{ color: textColor }}
          >
            ({grupo.total_membros} {grupo.total_membros === 1 ? 'ingresso' : 'ingressos'})
          </span>
        </div>
      </div>

      {/* Lista de Ingressos do Grupo - SEM LUCRO E SEM AÇÕES */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: hexToRgba(corAtual, 0.1) }}>
            <tr className="text-sm font-semibold" style={{ color: textColor }}>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">CPF</th>
              <th className="px-4 py-3 text-left">Nascimento</th>
              <th className="px-4 py-3 text-left">Contato</th>
              <th className="px-4 py-3 text-left">Setor</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {grupo.ingressos.map((ingresso, index) => (
              <tr 
                key={ingresso.id}
                className="border-b"
                style={{ 
                  borderBottomColor: borderColor,
                  backgroundColor: index % 2 === 0 ? '#ffffff' : hexToRgba(grupo.cor, 0.03)
                }}
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-base">{ingresso.cliente?.nome || 'N/A'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-mono">
                      {ingresso.cliente?.cpf ? formatCPF(ingresso.cliente.cpf) : '-'}
                    </span>
                    {ingresso.cliente?.id && cadastroFacialData[ingresso.cliente.id] && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <span>✓</span>
                        <span>Facial OK</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatBirthDate(ingresso.cliente?.data_nascimento)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {ingresso.cliente?.telefone && (
                      <div>📱 {formatPhone(ingresso.cliente.telefone)}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{ingresso.setor_estadio}</td>
                <td className="px-4 py-3 text-base font-bold" style={{ color: textColor }}>
                  {formatCurrency(ingresso.valor_final)}
                </td>
                <td className="px-4 py-3">
                  <span 
                    className="inline-block px-3 py-1.5 rounded-md text-sm font-semibold"
                    style={{
                      backgroundColor: ingresso.situacao_financeira === 'pago' 
                        ? '#22c55e' 
                        : ingresso.situacao_financeira === 'pendente'
                        ? '#f59e0b'
                        : '#ef4444',
                      color: '#ffffff'
                    }}
                  >
                    {getStatusText(ingresso.situacao_financeira)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé do Grupo */}
      <div 
        className="px-6 py-3 text-sm border-t font-semibold"
        style={{ 
          backgroundColor: hexToRgba(corAtual, 0.1),
          borderTopColor: borderColor,
          color: textColor
        }}
      >
        <div className="flex items-center justify-between">
          <span>
            Grupo: <strong>{grupo.nome}</strong>
          </span>
          <span>
            Total: {grupo.total_membros} ingresso{grupo.total_membros !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  </>
  );
}
