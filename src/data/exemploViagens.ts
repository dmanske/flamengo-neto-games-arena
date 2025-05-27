
export const exemploViagens = [
  {
    id: 'viagem-exemplo-1',
    adversario: 'Palmeiras',
    data_jogo: '2024-12-15T16:00:00',
    rota: 'Blumenau → São Paulo (Allianz Parque)',
    capacidade_onibus: 44,
    valor_padrao: 299.90,
    status_viagem: 'Aberta',
    logo_adversario: 'https://logoeps.com/wp-content/uploads/2014/03/palmeiras-vector-logo.png',
    ativa_loja: true,
    destaque_loja: true,
    descricao_loja: '🔥 CLÁSSICO IMPERDÍVEL! Flamengo x Palmeiras no Allianz Parque. Inclui transporte ida e volta, água no ônibus e acompanhamento da nossa equipe.',
    categoria: 'classico'
  },
  {
    id: 'viagem-exemplo-2',
    adversario: 'Corinthians',
    data_jogo: '2024-12-22T21:30:00',
    rota: 'Blumenau → São Paulo (Neo Química Arena)',
    capacidade_onibus: 44,
    valor_padrao: 319.90,
    status_viagem: 'Aberta',
    logo_adversario: 'https://logoeps.com/wp-content/uploads/2014/03/corinthians-vector-logo.png',
    ativa_loja: true,
    destaque_loja: false,
    descricao_loja: '⚫🔴 CLÁSSICO DOS MILHÕES! Último jogo do ano contra o Corinthians em São Paulo. Não perca essa oportunidade única!',
    categoria: 'classico'
  },
  {
    id: 'viagem-exemplo-3',
    adversario: 'Internacional',
    data_jogo: '2025-01-12T18:00:00',
    rota: 'Blumenau → Porto Alegre (Beira-Rio)',
    capacidade_onibus: 44,
    valor_padrao: 389.90,
    status_viagem: 'Aberta',
    logo_adversario: 'https://logoeps.com/wp-content/uploads/2014/03/internacional-vector-logo.png',
    ativa_loja: true,
    destaque_loja: false,
    descricao_loja: 'Viagem para o Sul! Flamengo x Internacional no estádio Beira-Rio. Inclui parada para almoço no trajeto.',
    categoria: 'campeonato'
  },
  {
    id: 'viagem-exemplo-4',
    adversario: 'Grêmio',
    data_jogo: '2025-01-26T16:00:00',
    rota: 'Blumenau → Porto Alegre (Arena do Grêmio)',
    capacidade_onibus: 44,
    valor_padrao: 379.90,
    status_viagem: 'Aberta',
    logo_adversario: 'https://logoeps.com/wp-content/uploads/2014/03/gremio-vector-logo.png',
    ativa_loja: true,
    destaque_loja: false,
    descricao_loja: 'Flamengo enfrenta o Grêmio na Arena! Viagem completa com toda a estrutura da Neto Tours.',
    categoria: 'campeonato'
  },
  {
    id: 'viagem-exemplo-5',
    adversario: 'São Paulo',
    data_jogo: '2025-02-09T21:00:00',
    rota: 'Blumenau → São Paulo (Morumbi)',
    capacidade_onibus: 44,
    valor_padrao: 289.90,
    status_viagem: 'Aberta',
    logo_adversario: 'https://logoeps.com/wp-content/uploads/2014/03/sao-paulo-vector-logo.png',
    ativa_loja: true,
    destaque_loja: true,
    descricao_loja: '🏆 JOGO NO MORUMBI! Flamengo x São Paulo no estádio histórico. Promoção especial para sócios-torcedores!',
    categoria: 'campeonato'
  }
];

export const exemploProdutos = [
  {
    id: 'produto-1',
    nome: 'Camisa Flamengo 2024 - Oficial',
    preco: 299.90,
    descricao: 'Camisa oficial do Flamengo temporada 2024. Material dry-fit de alta qualidade.',
    imagem: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
    categoria: 'Vestuário',
    em_estoque: true,
    destaque: true,
    tags: ['oficial', 'nova', 'dry-fit']
  },
  {
    id: 'produto-2',
    nome: 'Boné Oficial CRF',
    preco: 89.90,
    descricao: 'Boné oficial do Clube de Regatas do Flamengo com bordado em alta definição.',
    imagem: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    categoria: 'Acessórios',
    em_estoque: true,
    destaque: false,
    tags: ['oficial', 'bordado', 'unissex']
  },
  {
    id: 'produto-3',
    nome: 'Caneca Mengão 400ml',
    preco: 49.90,
    descricao: 'Caneca de porcelana com escudo do Flamengo. Ideal para o café da manhã rubro-negra.',
    imagem: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93c?w=400&h=400&fit=crop',
    categoria: 'Casa',
    em_estoque: true,
    destaque: false,
    tags: ['porcelana', 'escudo', '400ml']
  },
  {
    id: 'produto-4',
    nome: 'Agasalho Flamengo Training',
    preco: 189.90,
    descricao: 'Agasalho de treino oficial do Flamengo. Perfeito para os dias frios torcendo pelo Mengão.',
    imagem: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    categoria: 'Vestuário',
    em_estoque: true,
    destaque: true,
    tags: ['treino', 'oficial', 'inverno']
  },
  {
    id: 'produto-5',
    nome: 'Chaveiro Escudo CRF',
    preco: 24.90,
    descricao: 'Chaveiro em metal com o escudo do Flamengo. Leve o Mengão sempre com você!',
    imagem: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    categoria: 'Acessórios',
    em_estoque: true,
    destaque: false,
    tags: ['metal', 'escudo', 'chaveiro']
  },
  {
    id: 'produto-6',
    nome: 'Mochila Flamengo Oficial',
    preco: 129.90,
    descricao: 'Mochila oficial do Flamengo com múltiplos compartimentos. Ideal para escola e trabalho.',
    imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    categoria: 'Acessórios',
    em_estoque: false,
    destaque: false,
    tags: ['oficial', 'compartimentos', 'estudo']
  }
];
