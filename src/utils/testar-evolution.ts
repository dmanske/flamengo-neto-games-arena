// Utilitário para testar Evolution API
import { enviarMensagemEvolution, verificarStatusEvolution } from '@/lib/chat-apis';

export const testarEvolutionAPI = async () => {
  console.log('🧪 Testando Evolution API...');
  
  try {
    // 1. Verificar status da instância
    console.log('📡 Verificando status da instância...');
    const status = await verificarStatusEvolution();
    console.log('Status:', status);
    
    if (!status.conectado) {
      console.warn('⚠️ Instância não está conectada!');
      if (status.qrCode) {
        console.log('📱 QR Code disponível para conexão');
      }
      return false;
    }
    
    console.log('✅ Instância conectada!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao testar Evolution API:', error);
    return false;
  }
};

export const enviarMensagemTeste = async (telefone: string) => {
  try {
    console.log(`📤 Enviando mensagem teste para ${telefone}...`);
    
    const resultado = await enviarMensagemEvolution(
      telefone, 
      '🧪 Teste do sistema Flamengo Viagens!\n\nSe você recebeu esta mensagem, o chat está funcionando perfeitamente! 🎉'
    );
    
    console.log('✅ Mensagem enviada:', resultado);
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem teste:', error);
    throw error;
  }
};

// Função para usar no console do navegador
(window as any).testarEvolution = {
  status: testarEvolutionAPI,
  enviar: enviarMensagemTeste
};