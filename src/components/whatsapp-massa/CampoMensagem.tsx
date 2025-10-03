import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TemplatesMensagem } from './TemplatesMensagem';

interface CampoMensagemProps {
  mensagem: string;
  onMensagemChange: (mensagem: string) => void;
  linkGrupo?: string;
  onLinkGrupoChange?: (link: string) => void;
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

export const CampoMensagem: React.FC<CampoMensagemProps> = ({
  mensagem,
  onMensagemChange,
  linkGrupo = '',
  onLinkGrupoChange,
  dadosViagem
}) => {
  const caracteresCount = mensagem.length;
  const maxCaracteres = 1000; // Limite sugerido para WhatsApp
  const isOverLimit = caracteresCount > maxCaracteres;

  // Validação do link do WhatsApp
  const isValidWhatsAppLink = (link: string): boolean => {
    if (!link.trim()) return true; // Link vazio é válido
    const whatsappRegex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    return whatsappRegex.test(link);
  };

  const linkValido = isValidWhatsAppLink(linkGrupo);

  // Substituir variável {linkGrupo} na mensagem quando o link for alterado
  React.useEffect(() => {
    if (linkGrupo && mensagem.includes('{linkGrupo}')) {
      const mensagemAtualizada = mensagem.replace(/{linkGrupo}/g, linkGrupo);
      onMensagemChange(mensagemAtualizada);
    }
  }, [linkGrupo]);
  
  return (
    <div className="space-y-4">
      {/* Campo Link do Grupo */}
      {onLinkGrupoChange && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">🔗 Link do Grupo WhatsApp (opcional):</Label>
          <Input
            placeholder="https://chat.whatsapp.com/exemplo123"
            value={linkGrupo}
            onChange={(e) => onLinkGrupoChange(e.target.value)}
            className={`${!linkValido ? 'border-red-300 focus:border-red-500' : ''}`}
          />
          {!linkValido && linkGrupo.trim() && (
            <p className="text-xs text-red-500">
              ⚠️ Link inválido. Use o formato: https://chat.whatsapp.com/codigo
            </p>
          )}
          {linkValido && linkGrupo.trim() && (
            <p className="text-xs text-green-600">
              ✅ Link válido! Será substituído automaticamente na variável {'{linkGrupo}'}
            </p>
          )}
          <p className="text-xs text-gray-500">
            💡 Este link será usado para substituir a variável {'{linkGrupo}'} nas mensagens
          </p>
        </div>
      )}

      {/* Campo Mensagem */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Mensagem:</Label>
          <span className={`text-xs ${
            isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'
          }`}>
            {caracteresCount}/{maxCaracteres}
          </span>
        </div>
      
      <Textarea
        placeholder="Digite sua mensagem personalizada aqui...

Exemplo:
Olá! 👋

Lembrando da nossa viagem para o jogo do Flamengo!

📅 Data: [data do jogo]
🚌 Embarque: [horário e local]

Nos vemos lá! 🔴⚫"
        value={mensagem}
        onChange={(e) => onMensagemChange(e.target.value)}
        className={`min-h-[120px] resize-none ${
          isOverLimit ? 'border-red-300 focus:border-red-500' : ''
        }`}
        maxLength={maxCaracteres + 100} // Permite um pouco mais para não cortar abruptamente
      />
      
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <span>💡</span>
        <div>
          <p className="font-medium">Dicas para uma boa mensagem:</p>
          <ul className="mt-1 space-y-0.5 list-disc list-inside ml-2">
            <li>Seja claro e objetivo</li>
            <li>Inclua informações importantes (data, horário, local)</li>
            <li>Use emojis para deixar mais amigável</li>
            <li>Mantenha um tom cordial e profissional</li>
          </ul>
        </div>
      </div>
      
      {isOverLimit && (
        <p className="text-xs text-red-500 font-medium">
          ⚠️ Mensagem muito longa. Considere reduzir para melhor legibilidade no WhatsApp.
        </p>
      )}

        {/* Templates de Mensagem */}
        <div className="mt-6 pt-4 border-t">
          <TemplatesMensagem
            mensagem={mensagem}
            onMensagemChange={onMensagemChange}
            dadosViagem={dadosViagem}
          />
        </div>
      </div>
    </div>
  );
};