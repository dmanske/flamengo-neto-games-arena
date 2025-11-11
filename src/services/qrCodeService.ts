import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';

export interface PassageiroToken {
  passageiro_id: string;
  token: string;
  expires_at: string;
  passageiro_nome: string;
  passageiro_telefone: string;
}

export interface QRCodeData {
  token: string;
  qrCodeBase64: string;
  passageiro: {
    nome: string;
    telefone: string;
  };
}

export interface TokenValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  data?: {
    passageiro: {
      nome: string;
      telefone: string;
      cpf: string;
      cidade_embarque: string;
      setor_maracana: string;
      status_presenca: string;
    };
    viagem: {
      adversario: string;
      data_jogo: string;
      logo_flamengo?: string;
      logo_adversario?: string;
      status_viagem: string;
    };
    onibus?: {
      numero_identificacao: string;
      tipo_onibus: string;
      empresa: string;
    };
    token_info: {
      expires_at: string;
      created_at: string;
    };
  };
}

export interface ConfirmationResult {
  success: boolean;
  error?: string;
  message: string;
  data?: {
    passageiro: {
      nome: string;
      telefone: string;
      cidade_embarque: string;
      setor_maracana: string;
    };
    viagem: {
      adversario: string;
      data_jogo: string;
      logo_flamengo?: string;
      logo_adversario?: string;
    };
    confirmed_at: string;
    confirmation_method: string;
  };
}

class QRCodeService {
  /**
   * Gera QR codes para todos os passageiros de uma viagem
   */
  async generateQRCodesForViagem(viagemId: string): Promise<QRCodeData[]> {
    try {
      console.log('🔄 Gerando QR codes para viagem:', viagemId);

      // Chamar função do banco para gerar tokens
      const { data: tokens, error } = await supabase.rpc('generate_qr_tokens_for_viagem', {
        p_viagem_id: viagemId,
        p_created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('❌ Erro ao gerar tokens:', error);
        throw new Error(`Erro ao gerar tokens: ${error.message}`);
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('Nenhum passageiro encontrado para esta viagem');
      }

      console.log(`✅ ${tokens.length} tokens gerados com sucesso`);

      // Gerar QR codes para cada token
      const qrCodes: QRCodeData[] = [];
      
      for (const tokenData of tokens) {
        try {
          // QR code contém apenas o token
          const qrCodeBase64 = await QRCode.toDataURL(tokenData.token, {
            width: 400,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          });

          qrCodes.push({
            token: tokenData.token,
            qrCodeBase64,
            passageiro: {
              nome: tokenData.passageiro_nome,
              telefone: tokenData.passageiro_telefone
            }
          });

          // Salvar QR code no banco para cache
          await supabase
            .from('passageiro_qr_tokens')
            .update({ qr_code_data: qrCodeBase64 })
            .eq('token', tokenData.token);

        } catch (qrError) {
          console.error(`❌ Erro ao gerar QR code para ${tokenData.passageiro_nome}:`, qrError);
        }
      }

      console.log(`✅ ${qrCodes.length} QR codes gerados com sucesso`);
      return qrCodes;

    } catch (error) {
      console.error('❌ Erro geral ao gerar QR codes:', error);
      throw error;
    }
  }

  /**
   * Valida um token e retorna informações do passageiro/viagem
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      console.log('🔍 Validando token:', token);

      const { data, error } = await supabase.rpc('get_qr_token_info', {
        p_token: token
      });

      if (error) {
        console.error('❌ Erro ao validar token:', error);
        return {
          valid: false,
          error: 'VALIDATION_ERROR',
          message: 'Erro ao validar QR code'
        };
      }

      console.log('📋 Resultado da validação:', data);
      return data;

    } catch (error) {
      console.error('❌ Erro geral na validação:', error);
      return {
        valid: false,
        error: 'SYSTEM_ERROR',
        message: 'Erro interno do sistema'
      };
    }
  }

  /**
   * Confirma presença usando um token
   */
  async confirmPresence(token: string, method: 'qr_code' | 'qr_code_responsavel' = 'qr_code'): Promise<ConfirmationResult> {
    try {
      console.log('✅ Confirmando presença com token:', token);

      const { data, error } = await supabase.rpc('validate_and_use_qr_token', {
        p_token: token,
        p_confirmation_method: method,
        p_confirmed_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('❌ Erro na função SQL:', error);
        return {
          success: false,
          error: 'CONFIRMATION_ERROR',
          message: `❌ Erro ao confirmar presença: ${error.message}`
        };
      }

      console.log('📋 Resultado da confirmação:', data);
      return data as ConfirmationResult;

    } catch (error) {
      console.error('❌ Erro geral na confirmação:', error);
      return {
        success: false,
        error: 'SYSTEM_ERROR',
        message: '🔧 Erro interno do sistema'
      };
    }
  }

  /**
   * Busca QR codes existentes para uma viagem
   */
  async getQRCodesForViagem(viagemId: string): Promise<QRCodeData[]> {
    try {
      console.log('🔍 Buscando QR codes existentes para viagem:', viagemId);

      const { data: tokens, error: tokensError } = await supabase
        .from('passageiro_qr_tokens')
        .select(`
          token,
          qr_code_data,
          expires_at,
          used_at,
          passageiro_id
        `)
        .eq('viagem_id', viagemId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (tokensError) {
        console.error('❌ Erro ao buscar tokens:', tokensError);
        return [];
      }

      if (!tokens || tokens.length === 0) {
        console.log('ℹ️ Nenhum QR code encontrado para esta viagem');
        return [];
      }

      const passageiroIds = tokens.map(t => t.passageiro_id);
      const { data: passageiros, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select('id, cliente_id')
        .in('id', passageiroIds);

      if (passageirosError) {
        console.error('❌ Erro ao buscar passageiros:', passageirosError);
        return [];
      }

      const clienteIds = passageiros?.map(p => p.cliente_id) || [];
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, telefone')
        .in('id', clienteIds);

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError);
        return [];
      }

      const qrCodes: QRCodeData[] = [];
      
      for (const tokenData of tokens) {
        try {
          const passageiro = passageiros?.find(p => p.id === tokenData.passageiro_id);
          if (!passageiro) continue;

          const cliente = clientes?.find(c => c.id === passageiro.cliente_id);
          if (!cliente) continue;

          let qrCodeBase64 = tokenData.qr_code_data;
          
          if (!qrCodeBase64) {
            qrCodeBase64 = await QRCode.toDataURL(tokenData.token, {
              width: 400,
              margin: 3,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'M'
            });

            await supabase
              .from('passageiro_qr_tokens')
              .update({ qr_code_data: qrCodeBase64 })
              .eq('token', tokenData.token);
          }

          qrCodes.push({
            token: tokenData.token,
            qrCodeBase64,
            passageiro: {
              nome: cliente.nome,
              telefone: cliente.telefone
            }
          });

        } catch (qrError) {
          console.error(`❌ Erro ao processar QR code:`, qrError);
        }
      }

      console.log(`✅ ${qrCodes.length} QR codes carregados`);
      return qrCodes;

    } catch (error) {
      console.error('❌ Erro geral ao buscar QR codes:', error);
      return [];
    }
  }

  /**
   * Busca estatísticas de QR codes para uma viagem
   */
  async getQRCodeStats(viagemId: string) {
    try {
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select('status_presenca, confirmation_method')
        .eq('viagem_id', viagemId);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        return null;
      }

      const total = data?.length || 0;
      const confirmados = data?.filter(p => p.status_presenca === 'presente').length || 0;
      const confirmadosQR = data?.filter(p => p.confirmation_method === 'qr_code' && p.status_presenca === 'presente').length || 0;

      return {
        total_passageiros: total,
        confirmados,
        confirmados_qr: confirmadosQR
      };
    } catch (error) {
      console.error('❌ Erro geral ao buscar estatísticas:', error);
      return null;
    }
  }
}

export const qrCodeService = new QRCodeService();
