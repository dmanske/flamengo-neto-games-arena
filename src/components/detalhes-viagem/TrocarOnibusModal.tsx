import React, { useState } from 'react';
import { Bus, Users, AlertCircle, ArrowRight } from 'lucide-react';
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
import { useTrocaOnibus } from '@/hooks/useTrocaOnibus';
import type { PassageiroDisplay, Onibus } from '@/hooks/useViagemDetails';
import type { OnibusDisponivel } from '@/types/grupos-passageiros';

interface TrocarOnibusModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: PassageiroDisplay;
  onibusList: Onibus[];
  passageirosCount: Record<string, number>;
  onConfirm: () => void; // Callback para atualizar a lista após troca
}

export function TrocarOnibusModal({
  isOpen,
  onClose,
  passageiro,
  onibusList,
  passageirosCount,
  onConfirm
}: TrocarOnibusModalProps) {
  const [onibusDestinoId, setOnibusDestinoId] = useState<string>('');
  const [moverGrupoInteiro, setMoverGrupoInteiro] = useState<boolean>(false);
  const { trocarPassageiro, trocarGrupoInteiro, obterOnibusDisponiveis, loading } = useTrocaOnibus();

  // Obter lista de ônibus disponíveis com informações de capacidade
  const onibusDisponiveis = obterOnibusDisponiveis(onibusList, passageirosCount);
  
  // Encontrar ônibus atual do passageiro
  const onibusAtual = onibusList.find(o => o.id === passageiro.onibus_id);
  
  // Filtrar ônibus disponíveis (excluir o atual)
  const opcoesOnibus = onibusDisponiveis.filter(o => o.id !== passageiro.onibus_id);

  const handleConfirm = async () => {
    if (!onibusDestinoId) return;

    try {
      const destinoId = onibusDestinoId === 'sem-onibus' ? null : onibusDestinoId;
      
      // Se tem grupo e quer mover o grupo inteiro
      if (passageiro.grupo_nome && moverGrupoInteiro) {
        await trocarGrupoInteiro(passageiro.grupo_nome, passageiro.viagem_id, destinoId);
      } else {
        // Mover apenas o passageiro individual
        await trocarPassageiro(passageiro.viagem_passageiro_id, destinoId);
      }
      
      onConfirm(); // Atualizar lista
      onClose();
      setOnibusDestinoId('');
      setMoverGrupoInteiro(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleClose = () => {
    onClose();
    setOnibusDestinoId('');
    setMoverGrupoInteiro(false);
  };

  // Obter informações do ônibus de destino selecionado
  const onibusDestino = onibusDestinoId === 'sem-onibus' 
    ? null 
    : onibusDisponiveis.find(o => o.id === onibusDestinoId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Trocar Passageiro de Ônibus
          </DialogTitle>
          <DialogDescription>
            Selecione o ônibus de destino para {passageiro.nome}
            {passageiro.grupo_nome && (
              <span className="ml-1">
                (Grupo: <span className="font-medium">{passageiro.grupo_nome}</span>)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ônibus atual */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ônibus Atual</h4>
            {onibusAtual ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {onibusAtual.numero_identificacao || `${onibusAtual.tipo_onibus} - ${onibusAtual.empresa}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {passageirosCount[onibusAtual.id] || 0}/{onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Sem ônibus definido</span>
              </div>
            )}
          </div>

          {/* Seletor de ônibus de destino */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ônibus de Destino</label>
            <Select value={onibusDestinoId} onValueChange={setOnibusDestinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ônibus..." />
              </SelectTrigger>
              <SelectContent>
                {/* Lista de ônibus disponíveis */}
                {opcoesOnibus.map(onibus => (
                  <SelectItem 
                    key={onibus.id} 
                    value={onibus.id}
                    disabled={onibus.lotado}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        <span className={onibus.lotado ? 'text-gray-400' : ''}>
                          {onibus.nome}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="h-3 w-3" />
                          <span>{onibus.ocupacao}/{onibus.capacidade}</span>
                        </div>
                        {onibus.lotado ? (
                          <Badge variant="destructive" className="text-xs">Lotado</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {onibus.disponivel} vagas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview da troca */}
          {onibusDestinoId && onibusDestino && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Preview da Troca</span>
              </div>
              <div className="text-sm text-blue-700">
                {moverGrupoInteiro && passageiro.grupo_nome ? (
                  <>
                    <strong>Todo o grupo "{passageiro.grupo_nome}"</strong> será transferido para{' '}
                    <strong>{onibusDestino.nome}</strong>
                    <br />
                    <span className="text-xs text-amber-600">
                      ⚠️ Verificar se há capacidade suficiente para todo o grupo
                    </span>
                  </>
                ) : (
                  <>
                    <strong>{passageiro.nome}</strong> será transferido para{' '}
                    <strong>{onibusDestino.nome}</strong>
                    <br />
                    <span className="text-xs">
                      Ocupação após troca: {onibusDestino.ocupacao + 1}/{onibusDestino.capacidade}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Opção para mover grupo inteiro */}
          {passageiro.grupo_nome && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <div className="space-y-2">
                  <p>
                    Este passageiro faz parte do grupo <strong>{passageiro.grupo_nome}</strong>.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="moverGrupoInteiro"
                      className="rounded border-gray-300"
                      checked={moverGrupoInteiro}
                      onChange={(e) => setMoverGrupoInteiro(e.target.checked)}
                    />
                    <label htmlFor="moverGrupoInteiro" className="text-sm font-medium">
                      Mover todo o grupo junto
                    </label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!onibusDestinoId || loading}
            className="min-w-[100px]"
          >
            {loading ? 'Transferindo...' : 'Confirmar Troca'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}