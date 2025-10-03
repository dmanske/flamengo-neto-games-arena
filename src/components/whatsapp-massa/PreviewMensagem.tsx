import React from 'react';
import { Label } from '@/components/ui/label';
import { useTemplatesMensagem } from '@/hooks/useTemplatesMensagem';

interface PreviewMensagemProps {
  mensagem: string;
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

export const PreviewMensagem: React.FC<PreviewMensagemProps> = ({ mensagem, dadosViagem }) => {
  const { substituirVariaveis } = useTemplatesMensagem();
  
  const agora = new Date();
  const horarioAtual = agora.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Substituir variáveis na mensagem para o preview
  const mensagemComVariaveis = mensagem ? substituirVariaveis(mensagem, {
    nome: 'João Silva', // Nome exemplo para preview
    adversario: dadosViagem?.adversario || 'Adversário',
    dataJogo: dadosViagem?.dataJogo || 'Data do jogo',
    dataViagem: dadosViagem?.dataViagem || 'Data da viagem',
    horario: dadosViagem?.horario || 'Horário',
    localSaida: dadosViagem?.localSaida || 'Local de saída',
    valor: dadosViagem?.valor || 'R$ 150,00',
    onibus: dadosViagem?.onibus || 'Ônibus',
    prazo: dadosViagem?.prazo || 'Data limite'
  }) : '';
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Preview da Mensagem:</Label>
      
      <div className="bg-gray-100 rounded-lg p-4 border">
        {/* Header simulando WhatsApp */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            F
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">Flamengo Viagens</div>
            <div className="text-xs text-gray-500">online</div>
          </div>
        </div>
        
        {/* Mensagem */}
        <div className="flex justify-end">
          <div className="bg-green-500 text-white rounded-lg p-3 max-w-[85%] shadow-sm">
            <div className="text-sm whitespace-pre-wrap break-words">
              {mensagemComVariaveis || (
                <span className="text-green-100 italic">
                  Sua mensagem aparecerá aqui...
                </span>
              )}
            </div>
            <div className="flex items-center justify-end gap-1 mt-2 text-xs opacity-75">
              <span>{horarioAtual}</span>
              <span className="text-green-200">✓✓</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        📱 Este é um preview de como sua mensagem aparecerá no WhatsApp dos passageiros
      </p>
    </div>
  );
};