import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Eye, Copy } from 'lucide-react';
import { WhatsAppTemplate } from '@/types/whatsapp-templates';
import { toast } from 'sonner';

interface TemplateCategoryGroupProps {
  categoria: string;
  emoji: string;
  templates: WhatsAppTemplate[];
  onTemplateSelect: (template: WhatsAppTemplate) => void;
  dadosViagem?: any;
  isExpanded?: boolean;
}

export const TemplateCategoryGroup: React.FC<TemplateCategoryGroupProps> = ({
  categoria,
  emoji,
  templates,
  onTemplateSelect,
  dadosViagem,
  isExpanded: initialExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // Processar preview do template
  const getTemplatePreview = (template: WhatsAppTemplate): string => {
    const mockData = {
      NOME: 'João Silva',
      DESTINO: dadosViagem?.adversario || 'Rio de Janeiro',
      ADVERSARIO: dadosViagem?.adversario || 'Vasco',
      DATA: dadosViagem?.data_jogo ? new Date(dadosViagem.data_jogo).toLocaleDateString('pt-BR') : '15/12/2024',
      HORARIO: dadosViagem?.horario || '07:00',
      LOCAL_SAIDA: dadosViagem?.local_saida || 'Terminal Rodoviário',
      ONIBUS: dadosViagem?.onibus || 'Ônibus 001',
      LINK_GRUPO: 'https://chat.whatsapp.com/exemplo123',
      VALOR: 'R$ 150,00',
      TELEFONE: '(11) 99999-9999',
      HORARIO_CHEGADA: '06:30'
    };
    
    let preview = template.mensagem;
    Object.entries(mockData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  };

  // Copiar template para clipboard
  const handleCopyTemplate = async (template: WhatsAppTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(template.mensagem);
      toast.success('📋 Template copiado para área de transferência!');
    } catch (error) {
      toast.error('❌ Erro ao copiar template');
    }
  };

  // Mostrar preview
  const handleShowPreview = (template: WhatsAppTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const preview = getTemplatePreview(template);
    setPreviewTemplate(previewTemplate === template.id ? null : template.id);
  };

  // Aplicar template
  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    onTemplateSelect(template);
    toast.success(`✅ Template "${template.nome}" aplicado!`);
  };

  // Truncar texto longo
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-3">
      {/* Header da Categoria */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
        >
          <span className="text-lg">{emoji}</span>
          <h6 className="font-medium text-gray-800 capitalize">
            {categoria}
          </h6>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            {templates.length}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Templates da Categoria */}
      {isExpanded && (
        <div className="space-y-2 ml-4">
          {templates.map((template) => (
            <div key={template.id} className="space-y-2">
              {/* Card do Template */}
              <Card 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-blue-500 hover:border-l-blue-600"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Nome do Template */}
                    <div className="flex items-center gap-2 mb-2">
                      <h6 className="font-medium text-gray-800 truncate">
                        {template.nome}
                      </h6>
                      {template.variaveis && template.variaveis.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {template.variaveis.length} variáveis
                        </Badge>
                      )}
                    </div>

                    {/* Preview da Mensagem */}
                    <div className="text-sm text-gray-600 mb-2">
                      {truncateText(template.mensagem, 120)}
                    </div>

                    {/* Variáveis Usadas */}
                    {template.variaveis && template.variaveis.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.variaveis.slice(0, 5).map((variavel) => (
                          <span
                            key={variavel}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {`{${variavel}}`}
                          </span>
                        ))}
                        {template.variaveis.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{template.variaveis.length - 5} mais
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadados */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {template.updated_at !== template.created_at && (
                        <span>
                          • Atualizado em {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleShowPreview(template, e)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      title="Ver preview"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleCopyTemplate(template, e)}
                      className="h-8 w-8 p-0 hover:bg-green-100"
                      title="Copiar template"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Preview Expandido */}
              {previewTemplate === template.id && (
                <Card className="ml-4 p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <h6 className="font-medium text-blue-800">Preview da Mensagem:</h6>
                  </div>
                  <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                    {getTemplatePreview(template)}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    💡 Este é um preview com dados de exemplo. As variáveis serão substituídas pelos dados reais da viagem.
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};