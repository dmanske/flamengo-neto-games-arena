// ========================================
// SISTEMA DE VIAGENS DINÂMICAS - NETO TOURS
// ========================================
// Integração com Supabase para exibir viagens em tempo real
// Autor: Sistema Kiro
// Data: 2025

// Configuração do Supabase (carregada do config.js)
let supabase;

// Inicializar cliente Supabase
function inicializarSupabase() {
  if (typeof window.SUPABASE_CONFIG === 'undefined') {
    console.error('❌ Configuração do Supabase não encontrada! Certifique-se de incluir config.js');
    return false;
  }

  try {
    supabase = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey,
      window.SUPABASE_CONFIG.options
    );
    console.log('✅ Supabase inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Supabase:', error);
    return false;
  }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

// Formatar data e hora
function formatarDataHora(dataString) {
  try {
    const data = new Date(dataString);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dataFormatada} às ${horaFormatada}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data não disponível';
  }
}

// Formatar preço
function formatarPreco(valor) {
  if (!valor) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Determinar tipo de jogo baseado no adversário
function getTipoJogo(adversario) {
  const classicos = ['Vasco', 'Botafogo', 'Fluminense'];
  const grandes = ['Palmeiras', 'Corinthians', 'São Paulo', 'Santos'];
  
  if (classicos.some(time => adversario.includes(time))) {
    return { tipo: 'CLÁSSICO', cor: 'neto-red' };
  } else if (grandes.some(time => adversario.includes(time))) {
    return { tipo: 'GRANDE JOGO', cor: 'blue-600' };
  } else {
    return { tipo: 'BRASILEIRÃO', cor: 'neto-secondary' };
  }
}

// ========================================
// BUSCAR DADOS DO SUPABASE
// ========================================

// Buscar próximas viagens
async function buscarProximasViagens() {
  try {
    console.log('🔍 Buscando próximas viagens...');
    
    const { data, error } = await supabase
      .from('viagens')
      .select(`
        id, adversario, data_jogo, local_jogo, cidade_embarque,
        nome_estadio, valor_padrao, capacidade_onibus,
        logo_flamengo, logo_adversario, status_viagem
      `)
      .gte('data_jogo', new Date().toISOString())
      .in('status_viagem', ['Aberta', 'Em andamento'])
      .order('data_jogo', { ascending: true })
      .limit(6);

    if (error) {
      console.error('❌ Erro ao buscar viagens:', error);
      return [];
    }

    console.log(`✅ Encontradas ${data?.length || 0} próximas viagens`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return [];
  }
}

// Buscar viagens realizadas
async function buscarViagensRealizadas() {
  try {
    console.log('🔍 Buscando viagens realizadas...');
    
    const { data, error } = await supabase
      .from('viagens')
      .select(`
        id, adversario, data_jogo, local_jogo, cidade_embarque,
        nome_estadio, valor_padrao, logo_flamengo, logo_adversario
      `)
      .lt('data_jogo', new Date().toISOString())
      .order('data_jogo', { ascending: false })
      .limit(12);

    if (error) {
      console.error('❌ Erro ao buscar viagens realizadas:', error);
      return [];
    }

    console.log(`✅ Encontradas ${data?.length || 0} viagens realizadas`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return [];
  }
}

// ========================================
// GERAR HTML DOS CARDS
// ========================================

// Gerar card de próxima viagem
function gerarCardProximaViagem(viagem) {
  const tipoJogo = getTipoJogo(viagem.adversario);
  const dataHora = formatarDataHora(viagem.data_jogo);
  const preco = formatarPreco(viagem.valor_padrao);
  const logoFlamengo = viagem.logo_flamengo || 'https://logodetimes.com/times/flamengo/logo-flamengo-256.png';
  const logoAdversario = viagem.logo_adversario || 'https://via.placeholder.com/100x100?text=Logo';
  const estadio = viagem.nome_estadio || 'Estádio';
  const cidade = viagem.local_jogo || 'Cidade';
  const embarque = viagem.cidade_embarque || 'Blumenau';

  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
      <div class="relative">
        <img src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop" 
             alt="Estádio" class="w-full h-48 object-cover">
        <div class="absolute top-4 left-4 badge-flamengo text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${tipoJogo.tipo}
        </div>
        <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
          ✅ Vagas Abertas
        </div>
      </div>
      <div class="p-6 relative z-10">
        <div class="flex items-center gap-3 mb-4">
          <img src="${logoFlamengo}" alt="Flamengo" class="w-10 h-10 object-contain">
          <span class="text-lg font-bold text-gray-700">VS</span>
          <img src="${logoAdversario}" alt="${viagem.adversario}" class="w-10 h-10 object-contain">
        </div>
        
        <h3 class="font-oswald font-bold text-xl mb-2 text-gray-800">🔥 ${viagem.adversario.toUpperCase()}</h3>
        
        <div class="space-y-2 mb-4">
          <p class="flex items-center text-gray-600">
            <i class="fas fa-calendar-alt mr-2" style="color: #DC143C;"></i>
            ${dataHora}
          </p>
          <p class="flex items-center text-gray-600">
            <i class="fas fa-map-marker-alt mr-2" style="color: #DC143C;"></i>
            ${estadio} - ${cidade}
          </p>
          <p class="flex items-center text-gray-600">
            <i class="fas fa-bus mr-2" style="color: #DC143C;"></i>
            Embarque: ${embarque}
          </p>
          <p class="text-xs text-gray-500 italic ml-6">
            * Outras cidades disponíveis - consulte!
          </p>
        </div>
        
        <div class="border-t pt-4">
          <p class="text-2xl font-bold mb-4" style="color: #DC143C;">
            A partir de <span class="text-3xl">${preco}</span>
          </p>
          <div class="flex gap-2">
            <button class="flex-1 btn-flamengo text-white py-2 rounded-lg font-semibold">
              Ver Detalhes
            </button>
            <button class="flex-1 border-2 text-white py-2 rounded-lg font-semibold transition" style="border-color: #DC143C; background: #000000;">
              Tenho Interesse
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Gerar card de viagem realizada (sem botão "Tenho Interesse")
function gerarCardViagemRealizada(viagem) {
  const dataHora = formatarDataHora(viagem.data_jogo);
  const logoFlamengo = viagem.logo_flamengo || 'https://logodetimes.com/times/flamengo/logo-flamengo-256.png';
  const logoAdversario = viagem.logo_adversario || 'https://via.placeholder.com/100x100?text=Logo';
  const estadio = viagem.nome_estadio || 'Estádio';
  const cidade = viagem.local_jogo || 'Cidade';
  const embarque = viagem.cidade_embarque || 'Blumenau';

  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover opacity-90">
      <div class="relative">
        <img src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop" 
             alt="Estádio" class="w-full h-48 object-cover grayscale">
        <div class="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          REALIZADA
        </div>
      </div>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <img src="${logoFlamengo}" alt="Flamengo" class="w-8 h-8 object-contain">
          <span class="text-lg font-bold text-gray-500">VS</span>
          <img src="${logoAdversario}" alt="${viagem.adversario}" class="w-8 h-8 object-contain">
        </div>
        
        <h3 class="font-oswald font-bold text-xl mb-2 text-gray-700">🏆 ${viagem.adversario.toUpperCase()}</h3>
        
        <div class="space-y-2 mb-4">
          <p class="flex items-center text-gray-600">
            <i class="fas fa-calendar-alt mr-2 text-gray-500"></i>
            ${dataHora}
          </p>
          <p class="flex items-center text-gray-600">
            <i class="fas fa-map-marker-alt mr-2 text-gray-500"></i>
            ${estadio} - ${cidade}
          </p>
          <p class="flex items-center text-gray-600">
            <i class="fas fa-bus mr-2 text-gray-500"></i>
            Embarque: ${embarque}
          </p>
        </div>
        
        <div class="border-t pt-4">
          <p class="text-center text-gray-500 font-semibold">
            ✅ Viagem Realizada com Sucesso!
          </p>
        </div>
      </div>
    </div>
  `;
}

// ========================================
// RENDERIZAR SEÇÕES
// ========================================

// Renderizar próximas viagens
async function renderizarProximasViagens() {
  const container = document.getElementById('proximas-viagens-container');
  if (!container) {
    console.warn('⚠️ Container de próximas viagens não encontrado');
    return;
  }

  // Mostrar loading
  container.innerHTML = `
    <div class="col-span-full flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neto-primary"></div>
      <span class="ml-3 text-gray-600">Carregando próximas viagens...</span>
    </div>
  `;

  try {
    const viagens = await buscarProximasViagens();
    
    if (viagens.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-600 text-lg">Nenhuma viagem disponível no momento.</p>
          <p class="text-gray-500">Entre em contato para mais informações!</p>
        </div>
      `;
      return;
    }

    // Renderizar cards
    container.innerHTML = viagens.map(viagem => gerarCardProximaViagem(viagem)).join('');
    
  } catch (error) {
    console.error('❌ Erro ao renderizar próximas viagens:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600 text-lg">Erro ao carregar viagens.</p>
        <p class="text-gray-500">Tente novamente em alguns instantes.</p>
      </div>
    `;
  }
}

// Renderizar viagens realizadas
async function renderizarViagensRealizadas() {
  const container = document.getElementById('viagens-realizadas-container');
  if (!container) {
    console.warn('⚠️ Container de viagens realizadas não encontrado');
    return;
  }

  try {
    const viagens = await buscarViagensRealizadas();
    
    if (viagens.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-600 text-lg">Nenhuma viagem realizada encontrada.</p>
        </div>
      `;
      return;
    }

    // Renderizar cards
    container.innerHTML = viagens.map(viagem => gerarCardViagemRealizada(viagem)).join('');
    
  } catch (error) {
    console.error('❌ Erro ao renderizar viagens realizadas:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600 text-lg">Erro ao carregar histórico de viagens.</p>
      </div>
    `;
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando sistema de viagens dinâmicas...');
  
  // Verificar se o Supabase está disponível
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase não encontrado! Certifique-se de incluir o script do Supabase.');
    return;
  }

  // Inicializar Supabase
  if (!inicializarSupabase()) {
    console.error('❌ Falha ao inicializar Supabase');
    return;
  }

  // Renderizar seções
  renderizarProximasViagens();
  
  // Se estivermos na página de viagens realizadas, renderizar também
  if (window.location.pathname.includes('viagens-realizadas')) {
    renderizarViagensRealizadas();
  }
});

// Exportar funções para uso global
window.ViagensDinamicas = {
  buscarProximasViagens,
  buscarViagensRealizadas,
  renderizarProximasViagens,
  renderizarViagensRealizadas
};