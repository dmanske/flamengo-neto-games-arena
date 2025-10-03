import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o fuso horário do Brasil (São Paulo)
 * Lida corretamente com timestamps UTC e datas ISO
 */
export function formatarDataBrasil(dataString: string, formato: string = 'dd/MM/yyyy'): string {
  try {
    // Se a data contém timezone (+00:00), criar Date diretamente
    if (dataString.includes('T') && (dataString.includes('+') || dataString.includes('Z'))) {
      const data = new Date(dataString);
      return format(data, formato, { locale: ptBR });
    }
    
    // Se é apenas uma data (YYYY-MM-DD), tratar como data local
    if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = dataString.split('-');
      const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return format(data, formato, { locale: ptBR });
    }
    
    // Fallback para outros formatos
    const data = new Date(dataString);
    return format(data, formato, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error, dataString);
    return 'Data inválida';
  }
}

/**
 * Formata data e hora completa para o Brasil
 */
export function formatarDataHoraBrasil(dataString: string) {
  try {
    const data = new Date(dataString);
    return {
      data: formatarDataBrasil(dataString, 'dd/MM/yyyy'),
      diaSemana: format(data, 'EEEE', { locale: ptBR }),
      hora: format(data, 'HH:mm', { locale: ptBR }),
      dataCompleta: formatarDataBrasil(dataString, 'dd/MM/yyyy HH:mm')
    };
  } catch (error) {
    return {
      data: 'Data inválida',
      diaSemana: '',
      hora: '',
      dataCompleta: 'Data inválida'
    };
  }
}

/**
 * Calcula diferença de dias entre duas datas
 * Considera apenas a data, ignorando horário
 */
export function calcularDiferencaDias(dataInicio: string | Date, dataFim: string | Date): number {
  try {
    const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;
    
    // Zerar horários para calcular apenas diferença de dias
    const inicioSemHora = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const fimSemHora = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
    
    const diffTime = fimSemHora.getTime() - inicioSemHora.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Erro ao calcular diferença de dias:', error);
    return 0;
  }
}

/**
 * Extrai apenas a data (YYYY-MM-DD) de um timestamp
 */
export function extrairDataDoTimestamp(dataString: string): string {
  try {
    if (dataString.includes('T')) {
      return dataString.split('T')[0];
    }
    return dataString;
  } catch (error) {
    console.error('Erro ao extrair data do timestamp:', error);
    return dataString;
  }
}