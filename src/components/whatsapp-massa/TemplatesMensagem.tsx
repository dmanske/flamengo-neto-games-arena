import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Clipboard } from 'lucide-react';
import { useTemplatesMensagem, TemplateMensagem } from '@/hooks/useTemplatesMensagem';

interface TemplatesMensagemProps {
  mensagem: string;
  onMensagemChange: (mensagem: string) => void;
  dadosViagem?: {
    adversario?: string;
    dataJogo?: string;
    dataViagem?: string;
    horario?: string;
    localSaida?: string;
    valor?: string;
    onibus?: string;
    prazo?: string;
  };
}

export const TemplatesMensagem: React.FC<TemplatesMensagemProps> = ({
  mensagem,
  onMensagemChange,
  dadosViagem = {}
}) => {
  const { 
    templates, 
    substituirVariaveis, 
    copiarTexto, 
    colarTexto, 
    getTemplatesPorCategoria 
  } = useTemplatesMensagem();

  // Templates rápidos (mais usados)
  const templatesRapidos = getTemplatesPorCategoria().slice(0, 4);

  // Aplicar template
  const aplicarTemplate = (template: TemplateMensagem) => {
    const dados = {
      nome: '{nome}', // Mantém a variável para substituição posterior
      ...dadosViagem
    };
    
    const textoComVariaveis = substituirVariaveis(template.texto, dados);
    onMensagemChange(textoComVariaveis);
  };

  // Copiar mensagem atual
  const handleCopiar = () => {
    copiarTexto(mensagem);
  };

  // Colar do clipboard
  const handleColar = async () => {
    const textoColado = await colarTexto();
    if (textoColado) {
      onMensagemChange(textoColado);
    }
  };

  return (
    <div className="space-y-4">
      {/* Templates Rápidos */}
      <div>
        <h6 className="text-sm font-medium mb-2 text-gray-700">🚀 Templates Rápidos:</h6>
        <div className="flex flex-wrap gap-2">
          {templatesRapidos.map((template) => (
            <Button
              key={template.id}
              size="sm"
              variant="outline"
              onClick={() => aplicarTemplate(template)}
              className="text-xs"
            >
              {template.emoji} {template.nome}
            </Button>
          ))}
        </div>
      </div>

      {/* Dropdown com Todos os Templates */}
      <div>
        <h6 className="text-sm font-medium mb-2 text-gray-700">📋 Mais Templates:</h6>
        <Select onValueChange={(templateId) => {
          const template = templates.find(t => t.id === templateId);
          if (template) aplicarTemplate(template);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolher template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmacao" disabled className="font-medium text-blue-600">
              🏆 Confirmação
            </SelectItem>
            {getTemplatesPorCategoria('confirmacao').map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.emoji} {template.nome}
              </SelectItem>
            ))}
            
            <SelectItem value="pagamento" disabled className="font-medium text-green-600">
              💰 Pagamento
            </SelectItem>
            {getTemplatesPorCategoria('pagamento').map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.emoji} {template.nome}
              </SelectItem>
            ))}
            
            <SelectItem value="embarque" disabled className="font-medium text-orange-600">
              🚌 Embarque
            </SelectItem>
            {getTemplatesPorCategoria('embarque').map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.emoji} {template.nome}
              </SelectItem>
            ))}
            
            <SelectItem value="geral" disabled className="font-medium text-purple-600">
              📱 Geral
            </SelectItem>
            {getTemplatesPorCategoria('geral').map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.emoji} {template.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards com Preview dos Templates Principais */}
      <div>
        <h6 className="text-sm font-medium mb-2 text-gray-700">👀 Preview dos Templates:</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {templatesRapidos.map((template) => (
            <Card 
              key={template.id} 
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-blue-500"
              onClick={() => aplicarTemplate(template)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-800">
                  {template.emoji} {template.nome}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {template.categoria}
                </div>
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {template.preview}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Botões de Copiar/Colar */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopiar}
          disabled={!mensagem.trim()}
          className="flex-1"
        >
          <Copy className="h-3 w-3 mr-2" />
          📋 Copiar Mensagem
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleColar}
          className="flex-1"
        >
          <Clipboard className="h-3 w-3 mr-2" />
          📥 Colar do Clipboard
        </Button>
      </div>

      {/* Dica sobre Variáveis */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border-l-4 border-l-blue-400">
        <strong>💡 Dica:</strong> Use <code>{'{nome}'}</code> para personalizar com o nome do passageiro. 
        Outras variáveis disponíveis: <code>{'{adversario}'}</code>, <code>{'{dataJogo}'}</code>, <code>{'{valor}'}</code>, etc.
      </div>
    </div>
  );
};