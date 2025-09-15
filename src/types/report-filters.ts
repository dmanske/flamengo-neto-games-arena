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
  
  // Filtros Rápidos
  modoResponsavel: boolean; // Remove informações financeiras
  modoPassageiro: boolean; // Lista simplificada para passageiros
  modoEmpresaOnibus: boolean; // Lista para empresa de ônibus (CPF, data nascimento, embarque)
  modoComprarIngressos: boolean; // Lista para compra de ingressos (similar ao sistema de ingressos)
  modoComprarPasseios: boolean; // Lista para compra de passeios (foco em passeios e faixas etárias)
  modoTransfer: boolean; // Lista para transfer (agrupado por ônibus com rota, placa e motorista)
  mostrarStatusPagamento: boolean; // Para modo responsável
  mostrarValorPadrao: boolean; // Mostrar valor padrão nas informações da viagem
  mostrarValoresPassageiros: boolean; // Mostrar valores na lista de passageiros
  mostrarTelefone: boolean; // Mostrar telefone na lista
  mostrarFotoOnibus: boolean; // Mostrar foto do ônibus
  mostrarNumeroPassageiro: boolean; // Mostrar número sequencial do passageiro
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
  modoPassageiro: false,
  modoEmpresaOnibus: false,
  modoComprarIngressos: false,
  modoComprarPasseios: false,
  modoTransfer: false,
  mostrarStatusPagamento: true,
  mostrarValorPadrao: true,
  mostrarValoresPassageiros: true,
  mostrarTelefone: true,
  mostrarFotoOnibus: false,
  mostrarNumeroPassageiro: false,
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

// Preset para modo passageiro
export const passageiroModeFilters: Partial<ReportFilters> = {
  modoPassageiro: true,
  incluirResumoFinanceiro: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarTelefone: false,
  mostrarFotoOnibus: true,
  mostrarNumeroPassageiro: true,
  mostrarNomesPasseios: true,
  agruparPorOnibus: true,
};

// Preset para modo empresa de ônibus
export const empresaOnibusModeFilters: Partial<ReportFilters> = {
  modoEmpresaOnibus: true,
  modoResponsavel: false,
  modoPassageiro: false,
  modoComprarIngressos: false,
  modoComprarPasseios: false,
  incluirResumoFinanceiro: false,
  incluirDistribuicaoSetor: false, // Remove distribuição por setor
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarTelefone: false,
  mostrarNomesPasseios: false,
  mostrarFotoOnibus: false,
  mostrarNumeroPassageiro: true,
  agruparPorOnibus: true,
};

// Preset para modo comprar ingressos
export const comprarIngressosModeFilters: Partial<ReportFilters> = {
  modoComprarIngressos: true,
  modoResponsavel: false,
  modoPassageiro: false,
  modoEmpresaOnibus: false,
  modoComprarPasseios: false,
  incluirResumoFinanceiro: false,
  incluirDistribuicaoSetor: false,
  incluirListaOnibus: false,
  incluirPassageirosNaoAlocados: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarTelefone: false,
  mostrarNomesPasseios: false,
  mostrarFotoOnibus: false,
  mostrarNumeroPassageiro: true,
  agruparPorOnibus: false,
  setorMaracana: [], // Incluir todos os setores do Maracanã
};

// Preset para modo comprar passeios
export const comprarPasseiosModeFilters: Partial<ReportFilters> = {
  modoComprarPasseios: true,
  modoResponsavel: false,
  modoPassageiro: false,
  modoEmpresaOnibus: false,
  modoComprarIngressos: false,
  modoTransfer: false,
  incluirResumoFinanceiro: false,
  incluirDistribuicaoSetor: false, // Remove distribuição por setor
  incluirListaOnibus: false,
  incluirPassageirosNaoAlocados: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarTelefone: false,
  mostrarNomesPasseios: true, // Mostrar passeios na lista
  mostrarFotoOnibus: false,
  mostrarNumeroPassageiro: true,
  agruparPorOnibus: false,
};

// Preset para modo transfer
export const transferModeFilters: Partial<ReportFilters> = {
  modoTransfer: true,
  modoResponsavel: false,
  modoPassageiro: false,
  modoEmpresaOnibus: false,
  modoComprarIngressos: false,
  modoComprarPasseios: false,
  incluirResumoFinanceiro: false,
  incluirDistribuicaoSetor: false,
  incluirListaOnibus: false, // Remove lista de ônibus
  incluirPassageirosNaoAlocados: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false,
  mostrarTelefone: false,
  mostrarNomesPasseios: true, // Mostrar passeios na lista
  mostrarFotoOnibus: false,
  mostrarNumeroPassageiro: true,
  agruparPorOnibus: true, // Agrupar por ônibus
};