import React, { useState, useEffect } from 'react';
import { Bus, Users, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useTrocaOnibus } from '@/hooks/useTrocaOnibus';
import { useGruposPassageiros } from '@/hooks/useGruposPassageiros';
import type { PassageiroDisplay, Onibus } from '@/hooks/useViagemDetails';
import type { OnibusDisponivel } from '@/types/grupos-passageiros';

interface TrocarOnibusModalAvancadoProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: PassageiroDisplay;
  onibusList: Onibus[];
  passageiros: PassageiroDisplay[];
  passageirosCount: Record<string, number>;
  onConfirm: () => void;
}

interface PassageiroParaTroca {
  id: string;
  nome: string;
  grupo_nome?: string | null;
  grupo_cor?: string | null;
  tamanho_grupo: number;
  viagem_passageiro_id: string;
}

export function TrocarOnibusModalAvancado({
  isOpen,
  onClose,
  passageiro,
  onibusList,
  passageiros,
  passageirosCount,
  onConfirm
}: TrocarOnibusModalAvancadoProps) {
  const [onibusDestinoId, setOnibusDestinoId] = useState<string>('');
  const [modoTroca, setModoTroca] = useState<'individual' | 'grupo'>('individual');
  const [passageirosSelecionados, setPassageirosSelecionados] = useState<string[]>([]);
  const [etapa, setEtapa] = useState<'selecionar_onibus' | 'selecionar_passageiros'>('selecionar_onibus');
  
  const { trocarPassageiro, obterOnibusDisponiveis, loading } = useTrocaOnibus();
  const { agruparPassageiros } = useGruposPassageiros(passageiro.viagem_id);

  // Obter informações dos ônibus
  const onibusDisponiveis = obterOnibusDisponiveis(onibusList, passageirosCount);
  const onibusAtual = onibusList.find(o => o.id === passageiro.onibus_id);
  const onibusDestino = onibusDisponiveis.find(o => o.id === onibusDestinoId);

  // Determinar se passageiro faz parte de um grupo
  const temGrupo = passageiro.grupo_nome && passageiro.grupo_cor;
  const grupoPassageiro = temGrupo ? 
    passageiros.filter(p => p.grupo_nome === passageiro.grupo_nome && p.grupo_cor === passageiro.grupo_cor) : 
    [passageiro];

  // Debug do grupo
  console.log('🔍 Debug do grupo:', {
    passageiroNome: passageiro.nome,
    temGrupo,
    grupoNome: passageiro.grupo_nome,
    grupoCor: passageiro.grupo_cor,
    membrosEncontrados: grupoPassageiro.map(p => ({ nome: p.nome, id: p.viagem_passageiro_id })),
    totalMembros: grupoPassageiro.length
  });

  // Calcular tamanhos
  const tamanhoGrupoOrigem = modoTroca === 'grupo' ? grupoPassageiro.length : 1;
  const totalSelecionados = passageirosSelecionados.length;

  // Validar se a troca é possível
  const validarTroca = () => {
    if (!onibusDestino) return { valido: false, erro: 'Selecione um ônibus de destino' };
    
    const novaOcupacaoDestino = onibusDestino.ocupacao - totalSelecionados + tamanhoGrupoOrigem;
    const novaOcupacaoOrigem = (passageirosCount[passageiro.onibus_id || ''] || 0) - tamanhoGrupoOrigem + totalSelecionados;
    
    if (novaOcupacaoDestino > onibusDestino.capacidade) {
      return { 
        valido: false, 
        erro: `Ônibus de destino ficaria com ${novaOcupacaoDestino}/${onibusDestino.capacidade} (excede capacidade)` 
      };
    }
    
    const capacidadeOrigem = onibusAtual ? 
      onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0) : 0;
    
    if (novaOcupacaoOrigem > capacidadeOrigem) {
      return { 
        valido: false, 
        erro: `Ônibus de origem ficaria com ${novaOcupacaoOrigem}/${capacidadeOrigem} (excede capacidade)` 
      };
    }
    
    return { 
      valido: true, 
      novaOcupacaoDestino, 
      novaOcupacaoOrigem,
      capacidadeDestino: onibusDestino.capacidade,
      capacidadeOrigem
    };
  };

  // Obter passageiros disponíveis para troca no ônibus de destino
  const passageirosDisponiveis = passageiros.filter(p => 
    p.onibus_id === onibusDestinoId && 
    p.viagem_passageiro_id !== passageiro.viagem_passageiro_id
  );

  // Agrupar passageiros disponíveis
  const { grupos: gruposDisponiveis, semGrupo: individuaisDisponiveis } = 
    agruparPassageiros(passageirosDisponiveis);

  const handleContinuar = () => {
    if (!onibusDestinoId) return;
    
    const onibusDestino = onibusDisponiveis.find(o => o.id === onibusDestinoId);
    if (!onibusDestino) return;
    
    // Se há espaço suficiente, fazer troca direta
    if (onibusDestino.disponivel >= tamanhoGrupoOrigem) {
      handleConfirmarTroca();
    } else {
      // Precisa selecionar passageiros para trocar
      setEtapa('selecionar_passageiros');
    }
  };

  const handleConfirmarTroca = async () => {
    console.log('🔄 Iniciando troca avançada:', {
      etapa,
      modoTroca,
      tamanhoGrupoOrigem,
      totalSelecionados,
      onibusDestinoId,
      validacao: validacao
    });
    
    try {
      if (etapa === 'selecionar_onibus') {
        // Troca simples - só mover para ônibus com espaço
        console.log('🔄 Executando troca simples:', {
          modoTroca,
          grupoPassageiro: grupoPassageiro.map(p => ({ nome: p.nome, id: p.viagem_passageiro_id }))
        });
        
        if (modoTroca === 'grupo') {
          console.log('👥 Movendo grupo inteiro (troca simples):', grupoPassageiro.length, 'membros');
          // Mover grupo inteiro (sem bypass - validação normal)
          for (const membro of grupoPassageiro) {
            console.log('📤 Movendo membro do grupo:', membro.nome, membro.viagem_passageiro_id);
            await trocarPassageiro(membro.viagem_passageiro_id, onibusDestinoId);
          }
        } else {
          console.log('👤 Movendo passageiro individual (troca simples):', passageiro.nome);
          // Mover apenas o passageiro (sem bypass - validação normal)
          await trocarPassageiro(passageiro.viagem_passageiro_id, onibusDestinoId);
        }
      } else {
        // Troca complexa - trocar com passageiros selecionados
        console.log('🔄 Executando troca complexa:', {
          passageirosSelecionados,
          modoTroca,
          grupoPassageiro: grupoPassageiro.map(p => ({ nome: p.nome, id: p.viagem_passageiro_id }))
        });
        
        // Primeiro mover os selecionados para o ônibus de origem (com bypass de validação)
        for (const passageiroId of passageirosSelecionados) {
          console.log('📤 Movendo selecionado para origem:', passageiroId);
          await trocarPassageiro(passageiroId, passageiro.onibus_id, true);
        }
        
        // Depois mover o grupo/passageiro para o destino (com bypass de validação)
        if (modoTroca === 'grupo') {
          console.log('👥 Movendo grupo inteiro para destino:', grupoPassageiro.length, 'membros');
          for (const membro of grupoPassageiro) {
            console.log('📤 Movendo membro do grupo:', membro.nome, membro.viagem_passageiro_id);
            await trocarPassageiro(membro.viagem_passageiro_id, onibusDestinoId, true);
          }
        } else {
          console.log('👤 Movendo passageiro individual para destino:', passageiro.nome);
          await trocarPassageiro(passageiro.viagem_passageiro_id, onibusDestinoId, true);
        }
      }
      
      onConfirm();
      onClose();
      resetModal();
    } catch (error) {
      console.error('Erro na troca:', error);
    }
  };

  const resetModal = () => {
    setOnibusDestinoId('');
    setModoTroca('individual');
    setPassageirosSelecionados([]);
    setEtapa('selecionar_onibus');
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const togglePassageiroSelecionado = (passageiroId: string, tamanho: number = 1) => {
    setPassageirosSelecionados(prev => {
      const isSelected = prev.includes(passageiroId);
      if (isSelected) {
        return prev.filter(id => id !== passageiroId);
      } else {
        return [...prev, passageiroId];
      }
    });
  };

  const validacao = validarTroca();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Troca Inteligente de Passageiros
          </DialogTitle>
          <DialogDescription>
            {etapa === 'selecionar_onibus' ? 'Selecione o destino e modo de troca' : 'Selecione passageiros para trocar'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do passageiro/grupo */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                {passageiro.nome}
                {temGrupo && (
                  <span className="ml-2">
                    (Grupo: <span className="font-semibold">{passageiro.grupo_nome}</span> - {grupoPassageiro.length} pessoas)
                  </span>
                )}
              </span>
            </div>
            
            {/* Opções de modo se tem grupo */}
            {temGrupo && etapa === 'selecionar_onibus' && (
              <div className="space-y-2">
                <p className="text-sm text-blue-700">Como deseja mover?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modoTroca"
                      value="individual"
                      checked={modoTroca === 'individual'}
                      onChange={(e) => setModoTroca(e.target.value as 'individual')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Apenas {passageiro.nome}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modoTroca"
                      value="grupo"
                      checked={modoTroca === 'grupo'}
                      onChange={(e) => setModoTroca(e.target.value as 'grupo')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Todo o grupo ({grupoPassageiro.length} pessoas)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {etapa === 'selecionar_onibus' && (
            <>
              {/* Seletor de ônibus */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ônibus de Destino</label>
                <Select value={onibusDestinoId} onValueChange={setOnibusDestinoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ônibus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {onibusDisponiveis
                      .filter(o => o.id !== passageiro.onibus_id)
                      .map(onibus => (
                        <SelectItem key={onibus.id} value={onibus.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Bus className="h-4 w-4" />
                              <span>{onibus.nome}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="flex items-center gap-1 text-xs">
                                <Users className="h-3 w-3" />
                                <span>{onibus.ocupacao}/{onibus.capacidade}</span>
                              </div>
                              {onibus.disponivel >= tamanhoGrupoOrigem ? (
                                <Badge variant="secondary" className="text-xs">
                                  {onibus.disponivel} vagas
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Precisa trocar
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview da operação */}
              {onibusDestinoId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Preview da Operação</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Movendo:</strong> {modoTroca === 'grupo' ? `Grupo ${passageiro.grupo_nome} (${tamanhoGrupoOrigem} pessoas)` : passageiro.nome}
                    </p>
                    <p>
                      <strong>Para:</strong> {onibusDestino?.nome}
                    </p>
                    {onibusDestino && onibusDestino.disponivel < tamanhoGrupoOrigem && (
                      <p className="text-orange-600 mt-1">
                        ⚠️ Ônibus tem apenas {onibusDestino.disponivel} vagas. Será necessário selecionar {tamanhoGrupoOrigem - onibusDestino.disponivel} passageiro(s) para trocar.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {etapa === 'selecionar_passageiros' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Selecione {tamanhoGrupoOrigem} passageiro(s) do {onibusDestino?.nome} para trocar.
                  Selecionados: {totalSelecionados}/{tamanhoGrupoOrigem}
                </AlertDescription>
              </Alert>

              {/* Lista de grupos disponíveis */}
              {gruposDisponiveis.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Grupos Disponíveis:</h4>
                  {gruposDisponiveis.map(grupo => (
                    <div key={`${grupo.nome}-${grupo.cor}`} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={grupo.passageiros.every(p => passageirosSelecionados.includes(p.viagem_passageiro_id))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPassageirosSelecionados(prev => [
                              ...prev.filter(id => !grupo.passageiros.some(p => p.viagem_passageiro_id === id)),
                              ...grupo.passageiros.map(p => p.viagem_passageiro_id)
                            ]);
                          } else {
                            setPassageirosSelecionados(prev => 
                              prev.filter(id => !grupo.passageiros.some(p => p.viagem_passageiro_id === id))
                            );
                          }
                        }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: grupo.cor }}
                      />
                      <span className="font-medium">{grupo.nome}</span>
                      <Badge variant="outline" className="text-xs">
                        {grupo.total_membros} pessoas
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de passageiros individuais */}
              {individuaisDisponiveis.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Passageiros Individuais:</h4>
                  {individuaisDisponiveis.map(passageiro => (
                    <div key={passageiro.viagem_passageiro_id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={passageirosSelecionados.includes(passageiro.viagem_passageiro_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPassageirosSelecionados(prev => [...prev, passageiro.viagem_passageiro_id]);
                          } else {
                            setPassageirosSelecionados(prev => prev.filter(id => id !== passageiro.viagem_passageiro_id));
                          }
                        }}
                      />
                      <span>{passageiro.nome}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview da troca complexa */}
              {validacao.valido && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Troca Válida</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>Resultado após a troca:</p>
                    <p>• {onibusAtual?.numero_identificacao || 'Ônibus Atual'}: {validacao.novaOcupacaoOrigem}/{validacao.capacidadeOrigem}</p>
                    <p>• {onibusDestino?.nome}: {validacao.novaOcupacaoDestino}/{validacao.capacidadeDestino}</p>
                  </div>
                </div>
              )}

              {!validacao.valido && validacao.erro && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{validacao.erro}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          
          {etapa === 'selecionar_onibus' ? (
            <Button 
              onClick={handleContinuar} 
              disabled={!onibusDestinoId || loading}
            >
              {onibusDestino && onibusDestino.disponivel >= tamanhoGrupoOrigem ? 'Confirmar Troca' : 'Continuar'}
            </Button>
          ) : (
            <Button 
              onClick={handleConfirmarTroca} 
              disabled={!validacao.valido || loading}
            >
              {loading ? 'Trocando...' : 'Confirmar Troca'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}