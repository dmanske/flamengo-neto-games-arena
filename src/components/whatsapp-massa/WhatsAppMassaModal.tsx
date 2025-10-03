import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { usePassageirosWhatsApp } from '@/hooks/usePassageirosWhatsApp';
import { FiltroPassageiros } from './FiltroPassageiros';
import { CampoMensagem } from './CampoMensagem';
import { PreviewMensagem } from './PreviewMensagem';
import { EstatisticasPassageiros } from './EstatisticasPassageiros';
import { GerarListaContatos } from './GerarListaContatos';
import { ListaPassageirosIndividual } from './ListaPassageirosIndividual';

interface Viagem {
  id: string;
  adversario?: string;
  data_jogo?: string;
}

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  onibus_id?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface Onibus {
  id: string;
  numero_identificacao?: string;
  tipo_onibus?: string;
  empresa?: string;
}

interface WhatsAppMassaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  viagem: Viagem;
  passageiros: Passageiro[];
  onibusList: Onibus[];
}

export const WhatsAppMassaModal: React.FC<WhatsAppMassaModalProps> = ({
  open,
  onOpenChange,
  viagemId,
  viagem,
  passageiros,
  onibusList
}) => {
  const [filtroOnibus, setFiltroOnibus] = useState<string>('todos');
  const [mensagem, setMensagem] = useState<string>('');
  
  // Hook para lógica de WhatsApp
  const {
    passageirosFiltrados,
    gerarListaNumeros,
    gerarArquivoVCF,
    registrarHistorico
  } = usePassageirosWhatsApp(passageiros, filtroOnibus, viagemId);
  
  // Contar passageiros por ônibus para o filtro
  const passageirosCount = useMemo(() => {
    const count: Record<string, number> = {};
    
    onibusList.forEach(onibus => {
      count[onibus.id] = passageiros.filter(p => {
        const telefone = p.telefone || p.clientes?.telefone;
        const temTelefoneValido = telefone && telefone.trim() !== '' && telefone.replace(/\D/g, '').length >= 10;
        return p.onibus_id === onibus.id && temTelefoneValido;
      }).length;
    });
    
    return count;
  }, [passageiros, onibusList]);
  
  // Contar total de passageiros com telefone válido
  const totalPassageirosComTelefone = useMemo(() => {
    return passageiros.filter(p => {
      const telefone = p.telefone || p.clientes?.telefone;
      return telefone && telefone.trim() !== '' && telefone.replace(/\D/g, '').length >= 10;
    }).length;
  }, [passageiros]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-6 w-6 text-green-600" />
            WhatsApp em Massa
            {viagem.adversario && (
              <span className="text-gray-600 font-normal">- {viagem.adversario}</span>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Gere listas de contatos para usar no WhatsApp Business e enviar mensagens para todos os passageiros de uma vez só.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Configuração */}
          <div className="space-y-6">
            <FiltroPassageiros 
              onibusList={onibusList}
              filtroAtual={filtroOnibus}
              onFiltroChange={setFiltroOnibus}
              passageirosCount={passageirosCount}
              totalPassageiros={totalPassageirosComTelefone}
            />
            
            <CampoMensagem 
              mensagem={mensagem}
              onMensagemChange={setMensagem}
              dadosViagem={{
                adversario: viagem.adversario || 'Adversário',
                dataJogo: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data do jogo',
                dataViagem: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data da viagem',
                horario: '07:00', // Pode ser configurável
                localSaida: 'Local de saída', // Pode vir dos dados da viagem
                valor: 'R$ 150,00', // Pode vir dos dados da viagem
                onibus: filtroOnibus !== 'todos' ? onibusList.find(o => o.id === filtroOnibus)?.numero_identificacao || 'Ônibus' : 'Ônibus',
                prazo: 'Data limite' // Pode ser configurável
              }}
            />
            
            <PreviewMensagem 
              mensagem={mensagem} 
              dadosViagem={{
                adversario: viagem.adversario || 'Adversário',
                dataJogo: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data do jogo',
                dataViagem: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data da viagem',
                horario: '07:00',
                localSaida: 'Local de saída',
                valor: 'R$ 150,00',
                onibus: filtroOnibus !== 'todos' ? onibusList.find(o => o.id === filtroOnibus)?.numero_identificacao || 'Ônibus' : 'Ônibus',
                prazo: 'Data limite'
              }}
            />
          </div>
          
          {/* Coluna Direita - Estatísticas e Ações */}
          <div className="space-y-6">
            <EstatisticasPassageiros 
              passageirosFiltrados={passageirosFiltrados}
              totalPassageiros={passageiros.length}
              filtroAtual={filtroOnibus}
            />
            
            <GerarListaContatos
              passageiros={passageirosFiltrados}
              mensagem={mensagem}
              onGerarLista={gerarListaNumeros}
              onBaixarVCF={gerarArquivoVCF}
              onRegistrarHistorico={registrarHistorico}
              dadosViagem={{
                adversario: viagem.adversario || 'Adversário',
                dataJogo: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data do jogo',
                dataViagem: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data da viagem',
                horario: '07:00',
                localSaida: 'Local de saída',
                valor: 'R$ 150,00',
                onibus: filtroOnibus !== 'todos' ? onibusList.find(o => o.id === filtroOnibus)?.numero_identificacao || 'Ônibus' : 'Ônibus',
                prazo: 'Data limite'
              }}
            />

            <ListaPassageirosIndividual
              passageiros={passageirosFiltrados}
              mensagem={mensagem}
              dadosViagem={{
                adversario: viagem.adversario || 'Adversário',
                dataJogo: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data do jogo',
                dataViagem: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data da viagem',
                horario: '07:00',
                localSaida: 'Local de saída',
                valor: 'R$ 150,00',
                onibus: filtroOnibus !== 'todos' ? onibusList.find(o => o.id === filtroOnibus)?.numero_identificacao || 'Ônibus' : 'Ônibus',
                prazo: 'Data limite'
              }}
            />
          </div>
        </div>
        
        {/* Rodapé com informações importantes */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📱 Importante sobre o WhatsApp Business:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Lista de Transmissão:</strong> Permite enviar a mesma mensagem para até 256 contatos de uma vez</li>
              <li><strong>Privacidade:</strong> Cada pessoa recebe a mensagem individualmente (não veem outros destinatários)</li>
              <li><strong>Requisito:</strong> Os contatos precisam ter seu número salvo para receber a mensagem</li>
              <li><strong>Gratuito:</strong> Não há custo adicional para usar listas de transmissão</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};