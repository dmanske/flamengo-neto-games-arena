import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MessageCircle, Filter, FileText, Edit, Send, Users, CheckCircle, Phone } from 'lucide-react';
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

type SectionType = 'resumo' | 'filtros' | 'templates' | 'mensagem' | 'enviar';

export const WhatsAppMassaModal: React.FC<WhatsAppMassaModalProps> = ({
  open,
  onOpenChange,
  viagemId,
  viagem,
  passageiros,
  onibusList
}) => {
  const [activeSection, setActiveSection] = useState<SectionType>('resumo');
  const [filtroOnibus, setFiltroOnibus] = useState<string>('todos');
  const [mensagem, setMensagem] = useState<string>('');
  const [linkGrupo, setLinkGrupo] = useState<string>('');
  
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

  // Verificar status de cada seção
  const sectionStatus = {
    resumo: true,
    filtros: passageirosFiltrados.length > 0,
    templates: false,
    mensagem: mensagem.trim().length > 0,
    enviar: mensagem.trim().length > 0 && passageirosFiltrados.length > 0
  };

  // Definir seções da sidebar
  const sidebarSections = [
    {
      id: 'resumo' as SectionType,
      label: 'Resumo',
      icon: Users,
      complete: sectionStatus.resumo
    },
    {
      id: 'filtros' as SectionType,
      label: 'Filtros',
      icon: Filter,
      complete: sectionStatus.filtros
    },
    {
      id: 'templates' as SectionType,
      label: 'Templates',
      icon: FileText,
      complete: sectionStatus.templates
    },
    {
      id: 'mensagem' as SectionType,
      label: 'Mensagem',
      icon: Edit,
      complete: sectionStatus.mensagem
    },
    {
      id: 'enviar' as SectionType,
      label: 'Enviar',
      icon: Send,
      complete: sectionStatus.enviar
    }
  ];

  const dadosViagem = {
    adversario: viagem.adversario || 'Adversário',
    dataJogo: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data do jogo',
    dataViagem: viagem.data_jogo ? new Date(viagem.data_jogo).toLocaleDateString('pt-BR') : 'Data da viagem',
    horario: '07:00',
    localSaida: 'Local de saída',
    valor: 'R$ 150,00',
    onibus: filtroOnibus !== 'todos' ? onibusList.find(o => o.id === filtroOnibus)?.numero_identificacao || 'Ônibus' : 'Ônibus',
    prazo: 'Data limite'
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-6 w-6 text-green-600" />
            WhatsApp em Massa
            {viagem.adversario && (
              <span className="text-gray-600 font-normal">- {viagem.adversario}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r flex flex-col">
            {/* Estatísticas Rápidas */}
            <div className="p-4 border-b bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Users className="h-3 w-3 mr-1" />
                    {passageiros.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Com WhatsApp</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <Phone className="h-3 w-3 mr-1" />
                    {totalPassageirosComTelefone}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Selecionados</span>
                  <Badge className="bg-orange-100 text-orange-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {passageirosFiltrados.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex-1 p-2">
              <nav className="space-y-1">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full justify-start gap-3 ${
                        activeSection === section.id 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{section.label}</span>
                      {section.complete && activeSection !== section.id && (
                        <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                      )}
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* Status Geral */}
            <div className="p-4 border-t bg-white">
              <div className="text-xs text-gray-500 mb-2">Status Geral:</div>
              <div className="flex items-center gap-2">
                {Object.values(sectionStatus).filter(Boolean).length === Object.keys(sectionStatus).length ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Pronto para enviar</span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                    <span className="text-sm text-orange-700">Em configuração</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeSection === 'resumo' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      📊 Resumo da Viagem
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Visão geral dos passageiros e configurações atuais
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{passageiros.length}</div>
                          <div className="text-sm text-gray-600">Total de Passageiros</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{totalPassageirosComTelefone}</div>
                          <div className="text-sm text-gray-600">Com WhatsApp</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{passageirosFiltrados.length}</div>
                          <div className="text-sm text-gray-600">Selecionados</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <EstatisticasPassageiros 
                    passageirosFiltrados={passageirosFiltrados}
                    totalPassageiros={passageiros.length}
                    filtroAtual={filtroOnibus}
                  />
                </div>
              )}

              {activeSection === 'filtros' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      🔍 Filtrar Passageiros
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Escolha quais passageiros receberão a mensagem
                    </p>
                  </div>
                  
                  <FiltroPassageiros 
                    onibusList={onibusList}
                    filtroAtual={filtroOnibus}
                    onFiltroChange={setFiltroOnibus}
                    passageirosCount={passageirosCount}
                    totalPassageiros={totalPassageirosComTelefone}
                  />
                </div>
              )}

              {activeSection === 'templates' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      📋 Escolher Template
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Selecione um template ou crie sua mensagem personalizada
                    </p>
                  </div>
                  
                  <CampoMensagem 
                    mensagem={mensagem}
                    onMensagemChange={setMensagem}
                    linkGrupo={linkGrupo}
                    onLinkGrupoChange={setLinkGrupo}
                    dadosViagem={dadosViagem}
                  />
                </div>
              )}

              {activeSection === 'mensagem' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      ✏️ Revisar Mensagem
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Visualize como sua mensagem aparecerá no WhatsApp
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem Final:
                      </label>
                      <textarea
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none"
                        placeholder="Digite sua mensagem aqui..."
                      />
                    </div>
                    
                    <div>
                      <PreviewMensagem 
                        mensagem={mensagem} 
                        dadosViagem={dadosViagem}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'enviar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      🚀 Enviar Mensagens
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Escolha como enviar suas mensagens para os passageiros
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GerarListaContatos
                      passageiros={passageirosFiltrados}
                      mensagem={mensagem}
                      onGerarLista={gerarListaNumeros}
                      onBaixarVCF={gerarArquivoVCF}
                      onRegistrarHistorico={registrarHistorico}
                      dadosViagem={dadosViagem}
                    />

                    <ListaPassageirosIndividual
                      passageiros={passageirosFiltrados}
                      mensagem={mensagem}
                      dadosViagem={dadosViagem}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};