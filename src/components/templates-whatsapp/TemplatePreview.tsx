/**
 * =====================================================
 * COMPONENTE - PREVIEW DE TEMPLATE WHATSAPP
 * =====================================================
 * 
 * Componente para visualizar preview de templates
 * com dados simulados e informações detalhadas.
 */

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppTemplate, CATEGORY_LABELS, VARIABLE_DESCRIPTIONS } from '@/types/whatsapp-templates';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import {
  Eye,
  MessageSquare,
  Hash,
  BarChart3,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// =====================================================
// PROPS DO COMPONENTE
// =====================================================

interface TemplatePreviewProps {
  isOpen: boolean;
  template: WhatsAppTemplate;
  onClose: () => void;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function TemplatePreview({
  isOpen,
  template,
  onClose
}: TemplatePreviewProps) {
  
  // =====================================================
  // HOOKS
  // =====================================================
  
  const { previewTemplate } = useWhatsAppTemplates();
  
  // =====================================================
  // DADOS COMPUTADOS
  // =====================================================
  
  // Preview com dados simulados
  const previewData = useMemo(() => {
    return previewTemplate(template);
  }, [template, previewTemplate]);
  
  // Estatísticas do template
  const stats = useMemo(() => {
    return {
      caracteres: template.mensagem.length,
      linhas: template.mensagem.split('\n').length,
      palavras: template.mensagem.split(/\s+/).filter(word => word.length > 0).length,
      variaveis: template.variaveis.length,
      categoria: CATEGORY_LABELS[template.categoria],
      status: template.ativo ? 'Ativo' : 'Inativo'
    };
  }, [template]);
  
  // =====================================================
  // HANDLERS
  // =====================================================
  
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewData.mensagem_final);
    toast.success('Mensagem copiada para a área de transferência!');
  };
  
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(template.mensagem);
    toast.success('Template copiado para a área de transferência!');
  };
  
  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(previewData.mensagem_final);
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };
  
  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Preview: {template.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Informações do Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informações do Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-600">Categoria</div>
                  <Badge variant="outline">{stats.categoria}</Badge>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600">Status</div>
                  <Badge variant={template.ativo ? 'default' : 'secondary'}>
                    {stats.status}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600">Criado em</div>
                  <div className="text-sm font-medium">
                    {format(new Date(template.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600">Atualizado em</div>
                  <div className="text-sm font-medium">
                    {format(new Date(template.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Abas do Preview */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="original" className="gap-2">
                <Eye className="h-4 w-4" />
                Original
              </TabsTrigger>
              <TabsTrigger value="variaveis" className="gap-2">
                <Hash className="h-4 w-4" />
                Variáveis
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            {/* Aba Preview */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Mensagem com Dados Simulados</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyMessage}
                        className="gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        Copiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenWhatsApp}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Simulação de WhatsApp */}
                  <div className="bg-green-500 p-4 rounded-t-lg">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">João Silva</div>
                        <div className="text-xs opacity-80">online</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-b-lg">
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs ml-auto">
                      <div className="whitespace-pre-wrap text-sm">
                        {previewData.mensagem_final}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-right">
                        {new Date().toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} ✓✓
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status da Validação */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {previewData.valida ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        previewData.valida ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {previewData.valida ? 'Template Válido' : 'Template com Problemas'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {previewData.total_caracteres} caracteres
                    </div>
                  </div>
                  
                  {previewData.avisos && previewData.avisos.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm font-medium text-yellow-800 mb-1">Avisos:</div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {previewData.avisos.map((aviso, index) => (
                          <li key={index}>• {aviso}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Template Original */}
            <TabsContent value="original" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Template Original</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyTemplate}
                      className="gap-2"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 border rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {template.mensagem}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Variáveis */}
            <TabsContent value="variaveis" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Variáveis Utilizadas ({template.variaveis.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {template.variaveis.length > 0 ? (
                    <div className="space-y-3">
                      {template.variaveis.map((variable) => (
                        <div key={variable} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <div className="font-medium text-blue-800">
                              {'{' + variable + '}'}
                            </div>
                            <div className="text-sm text-blue-600">
                              {VARIABLE_DESCRIPTIONS[variable]}
                            </div>
                          </div>
                          <Badge variant="default" className="bg-blue-600">
                            {variable}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Hash className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Este template não usa variáveis dinâmicas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dados Simulados */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Dados Simulados para Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Dados do Passageiro:</div>
                      <div className="space-y-1 text-gray-600">
                        <div>• Nome: João Silva</div>
                        <div>• Telefone: (11) 98765-4321</div>
                        <div>• Valor: R$ 150,00</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Dados da Viagem:</div>
                      <div className="space-y-1 text-gray-600">
                        <div>• Destino: Rio de Janeiro</div>
                        <div>• Data: {new Date().toLocaleDateString('pt-BR')}</div>
                        <div>• Horário: 06:00</div>
                        <div>• Local: Terminal Rodoviário</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Estatísticas */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.caracteres}
                    </div>
                    <div className="text-sm text-gray-600">Caracteres</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.palavras}
                    </div>
                    <div className="text-sm text-gray-600">Palavras</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.linhas}
                    </div>
                    <div className="text-sm text-gray-600">Linhas</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.variaveis}
                    </div>
                    <div className="text-sm text-gray-600">Variáveis</div>
                  </CardContent>
                </Card>
              </div>

              {/* Análise de Compatibilidade */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Análise de Compatibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">WhatsApp Business</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Compatível
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">WhatsApp Web</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Compatível
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Tamanho da Mensagem</span>
                      </div>
                      <Badge variant={stats.caracteres <= 1000 ? 'default' : 'secondary'}>
                        {stats.caracteres <= 1000 ? 'Ideal' : 'Longa'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}