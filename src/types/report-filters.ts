// Tipos para filtros de relatórios PDF

export interface ReportFilters {
  // Filtros de Passageiros
  statusPagamento: 'todos' | 'pago' | 'pendente' | 'parcial';
  setorMaracana: string[]; // Array de setores selecionados
  onibusIds: string[]; // Array de IDs de ônibus selecionados
  passeiosSelecionados: string[]; // Array de IDs de passeios (para viagens novas)
  
  // Filtros de Passeios
  tipoPasseios: 'todos' | 'pagos' | 'gratuitos'; // Filtrar por tipo de passeio
  mostrarNomesPasseios: boolean; // Mostrar nomes dos passeios na lista
  
  // Filtros de Exibição
  incluirResumoFinanceiro: boolean;
  incluirDistribuicaoSetor: boolean;
  incluirListaOnibus: boolean;
  incluirPassageirosNaoAlocados: boolean;
  agruparPorOnibus: boolean;
  
  // Filtros de Dados
  valorMinimo?: number;
  valorMaximo?: number;
  apenasComDesconto: boolean;
  
  // Filtro Rápido para Responsável
  modoResponsavel: boolean; // Remove informações financeiras
  mostrarStatusPagamento: boolean; // Para modo responsável
  mostrarValorPadrao: boolean; // Mostrar valor padrão nas informações da viagem
  mostrarValoresPassageiros: boolean; // Mostrar valores na lista de passageiros
}

export interface ReportPreviewData {
  totalPassageiros: number;
  totalArrecadado: number;
  passageirosFiltrados: number;
  secoesSelecionadas: string[];
}

export const defaultReportFilters: ReportFilters = {
  statusPagamento: 'todos',
  setorMaracana: [],
  onibusIds: [],
  passeiosSelecionados: [],
  tipoPasseios: 'todos',
  mostrarNomesPasseios: true,
  incluirResumoFinanceiro: true,
  incluirDistribuicaoSetor: true,
  incluirListaOnibus: true,
  incluirPassageirosNaoAlocados: true,
  agruparPorOnibus: true,
  apenasComDesconto: false,
  modoResponsavel: false,
  mostrarStatusPagamento: true,
  mostrarValorPadrao: true,
  mostrarValoresPassageiros: true,
};

// Preset para modo responsável
export const responsavelModeFilters: Partial<ReportFilters> = {
  modoResponsavel: true,
  incluirResumoFinanceiro: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarNomesPasseios: true,
};