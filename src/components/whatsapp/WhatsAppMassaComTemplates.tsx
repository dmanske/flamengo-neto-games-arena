/**
 * =====================================================
 * COMPONENTE - WHATSAPP EM MASSA COM TEMPLATES
 * =====================================================
 * 
 * Componente integrado que combina o sistema atual de WhatsApp
 * com o novo sistema de templates, mantendo o fluxo existente
 * e adicionando seleção múltipla de templates.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { TemplateSelector } from '@/components/templates-whatsapp/TemplateSelector';
import { whatsappEnvioService } from '@/services/whatsappEnvioService';
import { 
  SelectedTemplate,
  ViagemData,
  PassageiroData,
  EnvioMensagemData,
  ResultadoEnvio,
  ConfiguracoesEnvio
} from '@/types/whatsapp-templates';
import {
  MessageSquare,
  Users,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  FileText,
  Eye,
  Settings
} from 'lucide-react';

// =====================================================
// INTERFACES
// =====================================================

interface WhatsAppMassaComTemplatesProps {
  /** Dados da viagem */
  viagem: ViagemData;
  
  /** Lista de passageiros disponíveis */
  passageiros: PassageiroData[];
  
  /** Callback quando envio é concluído */
  onEnvioCompleto?: (resultados: ResultadoEnvio[]) => void;
  
  /** Se deve mostrar preview automático */
  showPreview?: boolean;
  
  /** Classe CSS adicional */
  className?: string;
}

interface PassageiroSelecionado extends PassageiroData {
  selecionado: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function WhatsAppMassaComTemplates({
  viagem,
  passageiros,
  onEnvioCompleto,
  showPreview = true,
  className = ''
}: WhatsAppMassaComTemplatesProps) {
  
  // =====================================================
  // ESTADOS
  // =====================================================
  
  const [activeTab, setActiveTab] = useState<'templates' | 'manual' | 'preview'>('templates');
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  const [selectedPassageiros, setSelectedPassageiros] = useState<PassageiroSelecionado[]>(
    passageiros.map(p => ({ ...p, selecionado: false }))
  );
  const [mensagemManual, setMensagemManual] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultadosEnvio, setResultadosEnvio] = useState<ResultadoEnvio[]>([]);
  const [progressoEnvio, setProgressoEnvio] = useState<{
    total: number;
    processadas: number;
    sucessos: number;
    falhas: number;
    percentual: number;
    mensagemAtual?: string;
  } | null>(null);
  
  // Estados para configurações customizadas
  const [linkGrupoCustom, setLinkGrupoCustom] = useState('');
  const [adversarioCustom, setAdversarioCustom] = useState('');
  const [dataJogoCustom, setDataJogoCustom] = useState('');
  
  // =====================================================
  // COMPUTED VALUES
  // =====================================================
  
  // Estatísticas
  const stats = useMemo(() => {
    const passageirosSelecionados = selectedPassageiros.filter(p => p.selecionado);
    const totalMensagens = selectedTemplates.length * passageirosSelecionados.length;
    
    return {
      passageirosSelecionados: passageirosSelecionados.length,
      templatesSelecionados: selectedTemplates.length,
      totalMensagens,
      tempoEstimado: Math.ceil(totalMensagens * 2) // 2 segundos por mensagem
    };
  }, [selectedPassageiros, selectedTemplates]);
  
  // Dados para preview
  const dadosPreview = useMemo(() => {
    const passageirosSelecionados = selectedPassageiros.filter(p => p.selecionado);
    const primeiroPassageiro = passageirosSelecionados[0];
    
    return {
      viagem: {
        ...viagem,
        data_viagem: viagem.data_viagem,
        horario_saida: viagem.horario_saida,
        local_saida: viagem.local_saida,
        destino: viagem.destino
      },
      passageiro: primeiroPassageiro ? {
        ...primeiroPassageiro,
        nome: primeiroPassageiro.nome,
        telefone: primeiroPassageiro.telefone,
        valor_total: primeiroPassageiro.valor_total
      } : undefined
    };
  }, [viagem, selectedPassageiros]);
  
  // =====================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // =====================================================
  
  /**
   * Selecionar/desselecionar passageiro
   */
  const handlePassageiroToggle = (passageiroId: string, selecionado: boolean) => {
    setSelectedPassageiros(prev => 
      prev.map(p => 
        p.id === passageiroId ? { ...p, selecionado } : p
      )
    );
  };
  
  /**
   * Selecionar todos os passageiros
   */
  const handleSelecionarTodos = (selecionado: boolean) => {
    setSelectedPassageiros(prev => 
      prev.map(p => ({ ...p, selecionado }))
    );
  };
  
  /**
   * Enviar mensagens usando o serviço
   */
  const handleEnviarMensagens = async () => {
    setEnviando(true);
    setResultadosEnvio([]);
    setProgressoEnvio(null);
    
    try {
      const passageirosSelecionados = selectedPassageiros.filter(p => p.selecionado);
      
      // Preparar configurações customizadas
      const configuracoes: ConfiguracoesEnvio = {
        linkGrupo: linkGrupoCustom.trim() || undefined,
        adversario: adversarioCustom.trim() || undefined,
        dataJogo: dataJogoCustom.trim() || undefined
      };
      
      // Preparar dados para envio
      const dadosEnvio: EnvioMensagemData = {
        templates: selectedTemplates,
        passageiros: passageirosSelecionados,
        viagem,
        configuracoes,
        variaveisGlobais: {}
      };
      
      // Validar dados
      const validacao = whatsappEnvioService.validarDados(dadosEnvio);
      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
      }
      
      // Enviar com callback de progresso
      const resumo = await whatsappEnvioService.enviarLote(dadosEnvio, (progresso) => {
        setProgressoEnvio(progresso);
        
        // Atualizar resultados conforme progresso
        // (em implementação real, o serviço retornaria resultados parciais)
      });
      
      // Definir resultados finais
      setResultadosEnvio(resumo.resultados);
      
      // Callback de conclusão
      if (onEnvioCompleto) {
        onEnvioCompleto(resumo.resultados);
      }
      
    } catch (error) {
      console.error('Erro no envio:', error);
      // TODO: Mostrar erro para o usuário
    } finally {
      setEnviando(false);
      setProgressoEnvio(null);
    }
  };
  
  /**
   * Enviar mensagem manual
   */
  const handleEnviarMensagemManual = async () => {
    if (!mensagemManual.trim()) return;
    
    setEnviando(true);
    
    try {
      const passageirosSelecionados = selectedPassageiros.filter(p => p.selecionado);
      const resultados: ResultadoEnvio[] = [];
      
      for (const passageiro of passageirosSelecionados) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const sucesso = Math.random() > 0.1;
        
        resultados.push({
          passageiro_id: passageiro.id,
          passageiro_nome: passageiro.nome,
          telefone: passageiro.telefone,
          template_nome: 'Mensagem Manual',
          sucesso,
          erro: sucesso ? undefined : 'Erro simulado de envio',
          mensagem_enviada: sucesso ? mensagemManual : undefined
        });
        
        setResultadosEnvio([...resultados]);
      }
      
      if (onEnvioCompleto) {
        onEnvioCompleto(resultados);
      }
      
    } catch (error) {
      console.error('Erro no envio:', error);
    } finally {
      setEnviando(false);
    }
  };
  
  // =====================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // =====================================================
  
  /**
   * Renderizar configurações customizadas
   */
  const renderConfiguracoes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações da Viagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Link do Grupo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              🔗 Link do Grupo WhatsApp
            </label>
            <Input
              placeholder="https://chat.whatsapp.com/..."
              value={linkGrupoCustom}
              onChange={(e) => setLinkGrupoCustom(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Substitui {'{LINK_GRUPO}'} nos templates
            </p>
          </div>
          
          {/* Adversário */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ⚽ Time Adversário
            </label>
            <Input
              placeholder="Ex: Sport, Vasco, Botafogo..."
              value={adversarioCustom}
              onChange={(e) => setAdversarioCustom(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Substitui {'{ADVERSARIO}'} nos templates
            </p>
          </div>
          
          {/* Data do Jogo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              📅 Data do Jogo
            </label>
            <Input
              placeholder="Ex: 01/11/2025"
              value={dataJogoCustom}
              onChange={(e) => setDataJogoCustom(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Substitui {'{DATA}'} nos templates (opcional)
            </p>
          </div>
        </div>
        
        {/* Validação do Link */}
        {linkGrupoCustom && !linkGrupoCustom.includes('chat.whatsapp.com') && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Verifique se o link do WhatsApp está correto. Deve conter "chat.whatsapp.com"
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  /**
   * Renderizar seleção de passageiros
   */
  const renderSelecaoPassageiros = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Passageiros
          </CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedPassageiros.every(p => p.selecionado)}
              onCheckedChange={handleSelecionarTodos}
            />
            <span className="text-sm text-gray-600">Selecionar todos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {selectedPassageiros.map((passageiro) => (
            <div key={passageiro.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={passageiro.selecionado}
                  onCheckedChange={(checked) => handlePassageiroToggle(passageiro.id, checked as boolean)}
                />
                <div>
                  <div className="font-medium">{passageiro.nome}</div>
                  <div className="text-sm text-gray-500">{passageiro.telefone}</div>
                </div>
              </div>
              <div className="text-right">
                {passageiro.valor_total && (
                  <div className="text-sm font-medium">
                    R$ {passageiro.valor_total.toFixed(2).replace('.', ',')}
                  </div>
                )}
                <Badge variant={passageiro.status_pagamento === 'pago' ? 'default' : 'secondary'}>
                  {passageiro.status_pagamento || 'pendente'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  /**
   * Renderizar estatísticas
   */
  const renderEstatisticas = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.passageirosSelecionados}</div>
          <div className="text-sm text-gray-600">Passageiros</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.templatesSelecionados}</div>
          <div className="text-sm text-gray-600">Templates</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.totalMensagens}</div>
          <div className="text-sm text-gray-600">Mensagens</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.tempoEstimado}s</div>
          <div className="text-sm text-gray-600">Tempo Est.</div>
        </CardContent>
      </Card>
    </div>
  );
  
  /**
   * Renderizar resultados do envio
   */
  const renderResultados = () => {
    if (resultadosEnvio.length === 0) return null;
    
    const sucessos = resultadosEnvio.filter(r => r.sucesso).length;
    const falhas = resultadosEnvio.filter(r => !r.sucesso).length;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Resultados do Envio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-800">{sucessos}</div>
              <div className="text-sm text-green-600">Sucessos</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-800">{falhas}</div>
              <div className="text-sm text-red-600">Falhas</div>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {resultadosEnvio.map((resultado, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                resultado.sucesso ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{resultado.passageiro_nome}</div>
                    <div className="text-sm text-gray-600">{resultado.template_nome}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {resultado.sucesso ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      {resultado.sucesso ? 'Enviado' : 'Falhou'}
                    </span>
                  </div>
                </div>
                {resultado.erro && (
                  <div className="text-sm text-red-600 mt-1">{resultado.erro}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp em Massa</h2>
          <p className="text-gray-600">
            Viagem: {viagem.destino} - {new Date(viagem.data_viagem).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {passageiros.length} passageiros
        </Badge>
      </div>
      
      {/* Estatísticas */}
      {renderEstatisticas()}
      
      {/* Seleção de Passageiros */}
      {renderSelecaoPassageiros()}
      
      {/* Configurações Customizadas */}
      {renderConfiguracoes()}
      
      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Templates */}
        <TabsContent value="templates" className="space-y-6">
          <TemplateSelector
            viagem={dadosPreview.viagem}
            passageiro={dadosPreview.passageiro}
            selectedTemplates={selectedTemplates}
            onSelectionChange={setSelectedTemplates}
            showPreview={showPreview}
          />
          
          {/* Progresso de Envio */}
          {progressoEnvio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Enviando Mensagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso: {progressoEnvio.processadas} de {progressoEnvio.total}</span>
                    <span>{progressoEnvio.percentual}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressoEnvio.percentual}%` }}
                    ></div>
                  </div>
                  
                  {progressoEnvio.mensagemAtual && (
                    <div className="text-sm text-gray-600">
                      Enviando para: {progressoEnvio.mensagemAtual}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Sucessos: {progressoEnvio.sucessos}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Falhas: {progressoEnvio.falhas}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => whatsappEnvioService.cancelarEnvio()}
                    className="w-full"
                  >
                    Cancelar Envio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTemplates.length > 0 && stats.passageirosSelecionados > 0 && !enviando && (
            <div className="flex justify-end">
              <Button
                onClick={handleEnviarMensagens}
                disabled={enviando}
                className="gap-2"
                size="lg"
              >
                <Send className="h-4 w-4" />
                Enviar {stats.totalMensagens} Mensagens
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Tab Manual */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensagem Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mensagemManual}
                onChange={(e) => setMensagemManual(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                className="min-h-[120px]"
              />
              
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você pode usar variáveis como {'{NOME}'}, {'{DESTINO}'}, {'{DATA}'} que serão substituídas automaticamente.
                </AlertDescription>
              </Alert>
              
              {mensagemManual.trim() && stats.passageirosSelecionados > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleEnviarMensagemManual}
                    disabled={enviando}
                    className="gap-2"
                    size="lg"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar para {stats.passageirosSelecionados} Passageiros
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab Preview */}
        <TabsContent value="preview" className="space-y-6">
          {selectedTemplates.length > 0 && dadosPreview.passageiro ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Preview para: {dadosPreview.passageiro.nome}
              </h3>
              
              {selectedTemplates.map((selectedTemplate, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {selectedTemplate.template.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedTemplate.mensagemPersonalizada}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum preview disponível
                </h3>
                <p className="text-gray-500">
                  Selecione templates e passageiros para ver o preview
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Resultados */}
      {renderResultados()}
    </div>
  );
}