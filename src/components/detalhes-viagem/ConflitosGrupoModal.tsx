import React, { useState, useEffect } from 'react';
import { Bus, Users, ArrowRightLeft, Plus, AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';


import type { ConflitosGrupo } from '@/utils/validacoes-grupos-onibus';

interface ConflitosGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflitos: ConflitosGrupo;
  grupoNome: string;
  grupoCor: string;
  viagemId: string;
  onibusAtualId: string | null;
  passageiroAtualId?: string;
  onResolucao: (acao: string, dados?: any) => void;
}

interface OpcaoResolucao {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  disponivel: boolean;
  motivo?: string;
}

interface CapacidadeOnibus {
  id: string;
  nome: string;
  capacidade: number;
  ocupacao: number;
  vagasLivres: number;
}

export function ConflitosGrupoModal({
  isOpen,
  onClose,
  conflitos,
  grupoNome,
  grupoCor,
  viagemId,
  onibusAtualId,
  passageiroAtualId,
  onResolucao
}: ConflitosGrupoModalProps) {
  // Verificações de segurança
  if (!isOpen || !conflitos || !grupoNome || !viagemId) {
    return null;
  }
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string>('');
  const [novoNomeGrupo, setNovoNomeGrupo] = useState('');
  const [passageiroParaTroca, setPassageiroParaTroca] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Calcular informações dos conflitos
  const totalMembrosExistentes = conflitos?.totalMembrosOutrosOnibus || 0;
  const onibusConflitante = conflitos?.onibusConflitantes?.[0]; // Assumindo 1 ônibus por simplicidade
  const membrosExistentes = onibusConflitante?.membrosGrupo || [];

  // Versão simplificada - sem carregamento de capacidades por enquanto

  const opcoes: OpcaoResolucao[] = [
    {
      id: 'mover-grupo-para-ca',
      titulo: 'Mover grupo existente para cá',
      descricao: `Trazer ${totalMembrosExistentes} pessoas para este ônibus`,
      icone: <Bus className="h-4 w-4" />,
      disponivel: true, // Simplificado por enquanto
    },
    {
      id: 'trocar-por-especifico',
      titulo: 'Trocar por alguém específico',
      descricao: 'Escolher quem vem e quem vai (troca 1:1)',
      icone: <ArrowRightLeft className="h-4 w-4" />,
      disponivel: membrosExistentes.length > 0,
    },
    {
      id: 'manter-separados',
      titulo: 'Manter grupos separados',
      descricao: 'Mesmo nome em ônibus diferentes',
      icone: <Users className="h-4 w-4" />,
      disponivel: true,
    },
    {
      id: 'criar-novo-grupo',
      titulo: 'Criar novo grupo',
      descricao: 'Nome diferente para evitar confusão',
      icone: <Plus className="h-4 w-4" />,
      disponivel: true,
    }
  ];

  const handleConfirmar = () => {
    if (!opcaoSelecionada) return;

    const dados: any = {};

    switch (opcaoSelecionada) {
      case 'trocar-por-especifico':
        if (!passageiroParaTroca) return;
        dados.passageiroParaTroca = passageiroParaTroca;
        break;
      case 'criar-novo-grupo':
        if (!novoNomeGrupo.trim()) return;
        dados.novoNome = novoNomeGrupo.trim();
        break;
    }

    onResolucao(opcaoSelecionada, dados);
    onClose();
  };

  const opcaoAtual = opcoes.find(o => o.id === opcaoSelecionada);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando opções...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Conflito de Grupo Detectado
          </DialogTitle>
          <DialogDescription>
            O grupo <strong>"{grupoNome}"</strong> já existe em outro ônibus. 
            Escolha como resolver esta situação.
          </DialogDescription>
        </DialogHeader>

        {/* Informações do conflito */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">Grupo existente:</h4>
          <div className="text-sm text-yellow-700">
            <div className="flex items-center gap-2 mb-1">
              <Bus className="h-4 w-4" />
              <span>{onibusConflitante?.nomeOnibus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{membrosExistentes.map(m => m.nome).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Opções de resolução */}
        <div className="space-y-4">
          <h4 className="font-medium">Escolha uma opção:</h4>
          
          <div className="space-y-4">
            {opcoes.map((opcao) => (
              <div key={opcao.id} className="space-y-2">
                <div className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  opcao.disponivel 
                    ? 'border-gray-200 hover:border-blue-300 cursor-pointer' 
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}>
                  <input
                    type="radio"
                    name="opcao-resolucao"
                    value={opcao.id}
                    id={opcao.id}
                    disabled={!opcao.disponivel}
                    checked={opcaoSelecionada === opcao.id}
                    onChange={(e) => setOpcaoSelecionada(e.target.value)}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={opcao.id} 
                      className={`flex items-center gap-2 font-medium ${
                        opcao.disponivel ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      {opcao.icone}
                      {opcao.titulo}
                      {!opcao.disponivel && (
                        <Badge variant="secondary" className="text-xs">
                          Indisponível
                        </Badge>
                      )}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {opcao.descricao}
                      {opcao.motivo && (
                        <span className="text-red-600 ml-2">• {opcao.motivo}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Opções específicas */}
                {opcaoSelecionada === opcao.id && (
                  <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {opcao.id === 'trocar-por-especifico' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Escolha quem vem para este ônibus:
                        </Label>
                        <div className="space-y-2">
                          {membrosExistentes.map((membro) => (
                            <div key={membro.id} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="passageiro-troca"
                                value={membro.id}
                                id={membro.id}
                                checked={passageiroParaTroca === membro.id}
                                onChange={(e) => setPassageiroParaTroca(e.target.value)}
                                className="w-4 h-4"
                              />
                              <Label htmlFor={membro.id} className="text-sm cursor-pointer">
                                {membro.nome}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {opcao.id === 'criar-novo-grupo' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Nome do novo grupo:
                        </Label>
                        <Input
                          value={novoNomeGrupo}
                          onChange={(e) => setNovoNomeGrupo(e.target.value)}
                          placeholder={`Ex: ${grupoNome} 2, ${grupoNome} - Ônibus B`}
                          className="w-full"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Sugestões: {grupoNome} 2 • {grupoNome} Plus • {grupoNome} - Novo
                        </div>
                      </div>
                    )}


                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={!opcaoSelecionada || 
              (opcaoSelecionada === 'trocar-por-especifico' && !passageiroParaTroca) ||
              (opcaoSelecionada === 'criar-novo-grupo' && !novoNomeGrupo.trim())
            }
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}