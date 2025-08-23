# 🔥 ESPECIFICAÇÃO TÉCNICA - Website Institucional Caravana do Flamengo

## 📋 VISÃO GERAL DO PROJETO

### Objetivo
Desenvolver um website institucional moderno e responsivo para divulgar os serviços da **Caravana do Flamengo**, focando na venda de pacotes de viagem, passeios turísticos e produtos relacionados ao clube.

### Contexto do Negócio
Com base no sistema interno de gestão analisado, a Caravana do Flamengo oferece:
- **Viagens organizadas** para jogos do Flamengo
- **Passeios turísticos** no Rio de Janeiro (pagos e gratuitos)
- **Gestão completa** de passageiros e ônibus
- **Sistema financeiro** robusto com parcelamentos
- **Produtos e serviços** relacionados ao turismo esportivo

---

## 🎯 OBJETIVOS DO WEBSITE

### Primários
1. **Divulgar** os serviços da caravana (não o app interno)
2. **Vender** pacotes de viagem e passeios
3. **Processar pagamentos** via PIX e cartão (Mercado Pago)
4. **Capturar leads** e contatos de interessados
5. **Fortalecer** a marca da caravana

### Secundários
1. **Galeria** de fotos e vídeos das viagens
2. **Depoimentos** de clientes satisfeitos
3. **Blog/Notícias** sobre o Flamengo e turismo
4. **Área de contato** e suporte
5. **Integração** com redes sociais

---

## 🏗️ ARQUITETURA TÉCNICA RECOMENDADA

### Stack Tecnológica
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
UI Components: shadcn/ui (consistência com sistema interno)
Pagamentos: Mercado Pago SDK
CMS: Strapi ou Sanity (para conteúdo dinâmico)
Hospedagem: Vercel (frontend) + Railway/DigitalOcean (backend)
Banco de Dados: PostgreSQL (para pedidos e leads)
```

### Estrutura de Pastas Sugerida
```
src/
├── app/                    # App Router (Next.js 14)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Footer, Navigation
│   ├── sections/          # Seções da landing page
│   ├── forms/             # Formulários de contato/compra
│   └── payment/           # Componentes de pagamento
├── lib/
│   ├── mercadopago.ts     # Configuração MP
│   ├── database.ts        # Conexão DB
│   └── utils.ts           # Utilitários
├── types/                 # TypeScript types
└── styles/               # CSS global
```

---

## 📄 ESTRUTURA DO WEBSITE

### 1. **PÁGINA INICIAL (Landing Page)**

#### Hero Section
```
🔥 CARAVANA DO FLAMENGO
Viva a paixão rubro-negra com segurança e conforto!

[CTA: Ver Próximas Viagens] [CTA: Conhecer Passeios]

- Ônibus modernos e seguros
- Guias especializados
- Experiência completa
- Mais de X anos de tradição
```

#### Seções Principais
1. **Próximas Viagens** (cards com jogos agendados)
2. **Nossos Passeios** (preview dos principais)
3. **Por que Escolher a Gente** (diferenciais)
4. **Depoimentos** (carrossel de clientes)
5. **Galeria** (fotos/vídeos em destaque)
6. **Contato** (formulário + WhatsApp)

### 2. **PÁGINA DE VIAGENS**

#### Estrutura
```
/viagens
├── /proximas-viagens      # Jogos agendados
├── /viagem/[slug]         # Detalhes de viagem específica
└── /historico            # Viagens passadas (galeria)
```

#### Conteúdo por Viagem
- **Informações do Jogo**: Data, horário, estádio, adversário
- **Itinerário Completo**: Saída, chegada, atividades
- **Preços e Pacotes**: Diferentes opções disponíveis
- **Passeios Inclusos**: Lista de atividades gratuitas
- **Passeios Opcionais**: Atividades pagas à parte
- **Política de Cancelamento**: Termos e condições
- **Galeria**: Fotos de viagens similares anteriores

### 3. **PÁGINA DE PASSEIOS**

#### Categorização (baseada no sistema interno)
```
PASSEIOS GRATUITOS (Inclusos no Pacote):
- Lapa e Escadaria Selarón
- Copacabana, Ipanema e Leblon
- Boulevard Olímpico
- Cidade do Samba
- Pedra do Sal
- Parque Lage
- Igreja Catedral Metropolitana
- Teatro Municipal
- Barra da Tijuca
- Museu do Amanhã

PASSEIOS PAGOS À PARTE:
- Cristo Redentor (R$ XX)
- Pão de Açúcar (R$ XX)
- Museu do Flamengo (R$ XX)
- Aquário (R$ XX)
- Roda-Gigante (R$ XX)
- Tour do Maracanã (R$ XX)
- Rocinha + Vidigal (R$ XX)
- Tour da Gávea (R$ XX)
- Museu do Mar (R$ XX)
```

#### Estrutura por Passeio
- **Galeria de Fotos**: Imagens atrativas do local
- **Descrição Completa**: História, atrações, duração
- **Preço e Condições**: Valor, forma de pagamento
- **Itinerário**: Horários e pontos de parada
- **Dicas Importantes**: O que levar, restrições
- **Avaliações**: Comentários de participantes

### 4. **LOJA VIRTUAL**

#### Produtos Sugeridos
```
PACOTES DE VIAGEM:
- Pacote Básico (viagem + passeios gratuitos)
- Pacote Premium (viagem + passeios selecionados)
- Pacote Completo (viagem + todos os passeios)

PRODUTOS FÍSICOS:
- Camisas da Caravana
- Bonés e Acessórios
- Souvenirs do Rio de Janeiro
- Produtos Oficiais do Flamengo

SERVIÇOS EXTRAS:
- Seguro Viagem
- Hospedagem (parcerias)
- Transfer Aeroporto
- Guia Particular
```

#### Funcionalidades da Loja
- **Carrinho de Compras**: Múltiplos itens
- **Cálculo de Frete**: Para produtos físicos
- **Cupons de Desconto**: Sistema promocional
- **Wishlist**: Lista de desejos
- **Comparação**: Entre pacotes diferentes

### 5. **GALERIA MULTIMÍDIA**

#### Estrutura
```
/galeria
├── /fotos
│   ├── /viagens           # Por jogo/data
│   ├── /passeios          # Por local turístico
│   └── /bastidores        # Momentos especiais
└── /videos
    ├── /highlights        # Melhores momentos
    ├── /depoimentos       # Clientes falando
    └── /institucional     # Sobre a empresa
```

#### Funcionalidades
- **Filtros**: Por data, local, tipo de evento
- **Lightbox**: Visualização ampliada
- **Compartilhamento**: Redes sociais
- **Download**: Para clientes (com marca d'água)
- **Upload**: Área para clientes enviarem fotos

### 6. **ÁREA DE CONTATO**

#### Canais de Comunicação
- **Formulário Web**: Contato geral e orçamentos
- **WhatsApp Business**: Atendimento direto
- **Telefone**: Linha comercial
- **E-mail**: Contato institucional
- **Endereço**: Localização física (se houver)

#### Formulários Específicos
1. **Orçamento de Viagem**: Personalizado
2. **Dúvidas sobre Passeios**: Específico
3. **Suporte ao Cliente**: Pós-venda
4. **Parcerias**: Para empresas
5. **Trabalhe Conosco**: RH

---

## 💳 SISTEMA DE PAGAMENTOS

### Integração Mercado Pago

#### Métodos Aceitos
```
PIX:
- Pagamento instantâneo
- QR Code dinâmico
- Chave PIX da empresa
- Confirmação automática

CARTÃO DE CRÉDITO:
- Visa, Mastercard, Elo, Amex
- Parcelamento até 12x
- Antifraude integrado
- 3D Secure

CARTÃO DE DÉBITO:
- Principais bandeiras
- Confirmação em tempo real

BOLETO BANCÁRIO:
- Vencimento configurável
- Linha digitável
- Código de barras
```

#### Fluxo de Pagamento
1. **Seleção de Produtos**: Carrinho de compras
2. **Dados do Cliente**: Formulário completo
3. **Escolha do Pagamento**: Método preferido
4. **Processamento**: Via Mercado Pago
5. **Confirmação**: E-mail + WhatsApp
6. **Acompanhamento**: Status do pedido

### Estrutura de Preços Sugerida
```
VIAGENS (baseado no sistema interno):
- Valor Base: R$ 1.380,00 (exemplo)
- Desconto Antecipado: 10% (até 30 dias antes)
- Parcelamento: Até 10x sem juros
- Taxa de Conveniência: 3% (cartão)

PASSEIOS INDIVIDUAIS:
- Cristo Redentor: R$ 80,00
- Pão de Açúcar: R$ 70,00
- Museu do Flamengo: R$ 40,00
- Tour Maracanã: R$ 60,00
- Combo Passeios: Desconto progressivo
```

---

## 🎨 DESIGN E UX

### Identidade Visual

#### Paleta de Cores
```css
/* Cores do Flamengo */
--vermelho-flamengo: #E31E24
--preto-flamengo: #000000
--branco: #FFFFFF

/* Cores Complementares */
--cinza-claro: #F5F5F5
--cinza-medio: #CCCCCC
--cinza-escuro: #333333
--dourado: #FFD700 (para destaques)
```

#### Tipografia
```css
/* Headings */
font-family: 'Inter', 'Roboto', sans-serif
font-weight: 700, 600, 500

/* Body Text */
font-family: 'Inter', 'Roboto', sans-serif
font-weight: 400, 300

/* Accent */
font-family: 'Oswald', sans-serif (para títulos especiais)
```

### Componentes Principais

#### Cards de Viagem
```
[Imagem do Estádio/Jogo]
🔥 FLAMENGO vs ADVERSÁRIO
📅 DD/MM/AAAA - HH:MM
📍 Estádio Nome
💰 A partir de R$ XXX,XX
[Botão: Ver Detalhes] [Botão: Comprar Agora]
```

#### Cards de Passeio
```
[Galeria de Fotos]
🏛️ NOME DO PASSEIO
⭐ 4.8 (123 avaliações)
⏱️ Duração: X horas
💰 R$ XX,XX ou GRATUITO
[Botão: Saiba Mais] [Botão: Adicionar ao Carrinho]
```

### Responsividade
- **Mobile First**: Design otimizado para celular
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Touch Friendly**: Botões e links adequados
- **Performance**: Imagens otimizadas e lazy loading

---

## 📊 FUNCIONALIDADES AVANÇADAS

### 1. **Sistema de Reservas**

#### Fluxo de Reserva
1. **Seleção**: Viagem + passeios opcionais
2. **Personalização**: Preferências específicas
3. **Dados**: Informações pessoais completas
4. **Pagamento**: Processamento seguro
5. **Confirmação**: Voucher digital
6. **Acompanhamento**: Status em tempo real

#### Gestão de Vagas
- **Capacidade**: Controle por ônibus
- **Disponibilidade**: Tempo real
- **Lista de Espera**: Para viagens lotadas
- **Cancelamentos**: Política clara

### 2. **Área do Cliente**

#### Dashboard Pessoal
```
/minha-conta
├── /minhas-viagens        # Histórico e próximas
├── /meus-pagamentos       # Faturas e comprovantes
├── /meus-dados           # Perfil pessoal
├── /documentos           # Vouchers e contratos
└── /suporte              # Tickets de atendimento
```

#### Funcionalidades
- **Login Social**: Google, Facebook
- **Recuperação**: Senha por e-mail/SMS
- **Notificações**: E-mail e push
- **Documentos**: Download de vouchers
- **Histórico**: Todas as viagens realizadas

### 3. **Sistema de Avaliações**

#### Estrutura
- **Nota Geral**: 1 a 5 estrelas
- **Categorias**: Transporte, Passeios, Atendimento
- **Comentários**: Texto livre
- **Fotos**: Upload pelos clientes
- **Moderação**: Aprovação manual

#### Exibição
- **Média Geral**: Por viagem/passeio
- **Filtros**: Por nota, data, tipo
- **Destaque**: Melhores avaliações
- **Resposta**: Da empresa aos comentários

### 4. **Blog/Notícias**

#### Categorias de Conteúdo
```
FLAMENGO:
- Notícias do clube
- Análises de jogos
- História rubro-negra
- Curiosidades

TURISMO:
- Dicas do Rio de Janeiro
- Roteiros alternativos
- Cultura carioca
- Gastronomia local

CARAVANA:
- Bastidores das viagens
- Depoimentos especiais
- Novidades da empresa
- Promoções exclusivas
```

#### SEO e Marketing
- **URLs Amigáveis**: /blog/categoria/titulo-do-post
- **Meta Tags**: Otimizadas para busca
- **Compartilhamento**: Redes sociais
- **Newsletter**: Captura de e-mails
- **Relacionados**: Posts similares

---

## 🔧 INTEGRAÇÕES TÉCNICAS

### 1. **APIs Externas**

#### Mercado Pago
```javascript
// Configuração básica
const mercadopago = require('mercadopago');
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// Criar preferência de pagamento
const preference = {
  items: [{
    title: 'Viagem Flamengo vs Palmeiras',
    unit_price: 1380.00,
    quantity: 1,
  }],
  payment_methods: {
    excluded_payment_types: [],
    installments: 12
  },
  back_urls: {
    success: '/pagamento/sucesso',
    failure: '/pagamento/erro',
    pending: '/pagamento/pendente'
  }
};
```

#### WhatsApp Business API
```javascript
// Integração para notificações
const whatsapp = {
  sendMessage: async (phone, message) => {
    // Implementação da API do WhatsApp
  },
  sendTemplate: async (phone, template, params) => {
    // Templates pré-aprovados
  }
};
```

### 2. **Banco de Dados**

#### Schema Principal
```sql
-- Tabelas essenciais
CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  data_nascimento DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE viagens (
  id UUID PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_jogo TIMESTAMP,
  preco_base DECIMAL(10,2),
  capacidade INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reservas (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  viagem_id UUID REFERENCES viagens(id),
  valor_total DECIMAL(10,2),
  status_pagamento VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE passeios_reserva (
  id UUID PRIMARY KEY,
  reserva_id UUID REFERENCES reservas(id),
  passeio_nome VARCHAR(255),
  valor DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **Sistema de E-mails**

#### Templates Automáticos
```
CONFIRMAÇÃO DE RESERVA:
- Dados da viagem
- Itinerário completo
- Voucher digital
- Instruções importantes

LEMBRETE DE PAGAMENTO:
- Dados da pendência
- Link para pagamento
- Opções de parcelamento
- Contato para dúvidas

CONFIRMAÇÃO DE PAGAMENTO:
- Comprovante digital
- Próximos passos
- Contatos importantes
- Política de cancelamento

PRÉ-VIAGEM:
- Checklist de preparação
- Ponto de encontro
- Contatos de emergência
- Previsão do tempo
```

---

## 📱 OTIMIZAÇÕES E PERFORMANCE

### 1. **SEO (Search Engine Optimization)**

#### Estratégias
```
PALAVRAS-CHAVE PRINCIPAIS:
- "caravana flamengo"
- "viagem flamengo"
- "passeios rio de janeiro"
- "turismo esportivo"
- "excursão flamengo"

CONTEÚDO OTIMIZADO:
- Títulos H1, H2, H3 estruturados
- Meta descriptions únicas
- Alt text em todas as imagens
- Schema markup para eventos
- URLs semânticas

PERFORMANCE:
- Core Web Vitals otimizados
- Imagens em WebP/AVIF
- Lazy loading implementado
- CDN para assets estáticos
```

### 2. **Analytics e Tracking**

#### Ferramentas
```
GOOGLE ANALYTICS 4:
- Conversões de vendas
- Funil de compras
- Comportamento do usuário
- Origem do tráfego

FACEBOOK PIXEL:
- Remarketing
- Lookalike audiences
- Conversões sociais
- ROI de campanhas

HOTJAR/MICROSOFT CLARITY:
- Heatmaps de cliques
- Gravações de sessão
- Formulários abandonados
- Feedback dos usuários
```

### 3. **Segurança**

#### Medidas Implementadas
```
HTTPS OBRIGATÓRIO:
- Certificado SSL/TLS
- Redirecionamento automático
- HSTS headers

PROTEÇÃO DE DADOS:
- LGPD compliance
- Criptografia de senhas
- Tokenização de cartões
- Logs de auditoria

PREVENÇÃO DE FRAUDES:
- Rate limiting
- CAPTCHA em formulários
- Validação de CPF
- Geolocalização de IPs
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: MVP (4-6 semanas)
```
SEMANA 1-2: SETUP E ESTRUTURA
✅ Configuração do projeto Next.js
✅ Design system com shadcn/ui
✅ Estrutura de páginas principais
✅ Integração com Mercado Pago

SEMANA 3-4: FUNCIONALIDADES CORE
✅ Página inicial (landing page)
✅ Catálogo de viagens
✅ Sistema de carrinho
✅ Checkout básico

SEMANA 5-6: FINALIZAÇÃO MVP
✅ Área do cliente básica
✅ Sistema de pagamentos
✅ E-mails automáticos
✅ Testes e deploy
```

### Fase 2: Expansão (4-6 semanas)
```
SEMANA 7-8: CONTEÚDO AVANÇADO
✅ Galeria completa
✅ Sistema de avaliações
✅ Blog/notícias
✅ SEO otimizado

SEMANA 9-10: FUNCIONALIDADES PREMIUM
✅ Área do cliente completa
✅ Sistema de cupons
✅ Relatórios administrativos
✅ Integrações avançadas

SEMANA 11-12: OTIMIZAÇÕES
✅ Performance tuning
✅ Analytics implementado
✅ Testes de carga
✅ Documentação final
```

### Fase 3: Melhorias Contínuas (Ongoing)
```
MARKETING DIGITAL:
- Campanhas Google Ads
- Social media integration
- Email marketing
- Programa de afiliados

FUNCIONALIDADES EXTRAS:
- App mobile (PWA)
- Chatbot inteligente
- Programa de fidelidade
- Integração com CRM
```

---

## 💰 ESTIMATIVA DE INVESTIMENTO

### Desenvolvimento (Valores Aproximados)
```
FASE 1 - MVP:
- Frontend Development: R$ 15.000 - R$ 25.000
- Backend Development: R$ 10.000 - R$ 15.000
- Design UI/UX: R$ 5.000 - R$ 8.000
- Integração Pagamentos: R$ 3.000 - R$ 5.000
SUBTOTAL FASE 1: R$ 33.000 - R$ 53.000

FASE 2 - EXPANSÃO:
- Funcionalidades Avançadas: R$ 10.000 - R$ 15.000
- CMS e Admin: R$ 5.000 - R$ 8.000
- SEO e Performance: R$ 3.000 - R$ 5.000
- Testes e QA: R$ 2.000 - R$ 4.000
SUBTOTAL FASE 2: R$ 20.000 - R$ 32.000

TOTAL DESENVOLVIMENTO: R$ 53.000 - R$ 85.000
```

### Custos Mensais Operacionais
```
HOSPEDAGEM E INFRAESTRUTURA:
- Vercel Pro: R$ 100/mês
- Banco de dados: R$ 150/mês
- CDN e Storage: R$ 50/mês
- Backup e Monitoramento: R$ 80/mês

SERVIÇOS TERCEIROS:
- Mercado Pago: 3,99% + R$ 0,40 por transação
- E-mail Marketing: R$ 200/mês
- Analytics Premium: R$ 150/mês
- SSL e Segurança: R$ 100/mês

TOTAL MENSAL: R$ 830/mês + taxas de transação
```

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs Principais
```
CONVERSÃO:
- Taxa de conversão geral: > 2%
- Carrinho abandonado: < 70%
- Tempo no site: > 3 minutos
- Páginas por sessão: > 4

VENDAS:
- Ticket médio: R$ 1.500
- Vendas mensais: Meta definida
- ROI campanhas: > 300%
- LTV/CAC ratio: > 3:1

EXPERIÊNCIA:
- Page Speed: > 90 (Google PageSpeed)
- Uptime: > 99.9%
- Satisfação cliente: > 4.5/5
- Suporte: < 2h resposta
```

### Relatórios Mensais
1. **Dashboard Executivo**: Vendas, conversões, ROI
2. **Relatório de Tráfego**: Origens, comportamento, dispositivos
3. **Análise de Produtos**: Viagens/passeios mais vendidos
4. **Feedback Clientes**: Avaliações, sugestões, reclamações
5. **Performance Técnica**: Velocidade, erros, disponibilidade

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Imediatos (Esta Semana)
1. **Aprovação da Especificação**: Review e ajustes finais
2. **Definição de Orçamento**: Valores e cronograma
3. **Seleção da Equipe**: Desenvolvedores e designers
4. **Setup Inicial**: Domínio, hospedagem, ferramentas

### Curto Prazo (Próximas 2 Semanas)
1. **Briefing de Design**: Identidade visual detalhada
2. **Conteúdo Inicial**: Textos, fotos, vídeos
3. **Configuração Mercado Pago**: Conta e credenciais
4. **Planejamento de Conteúdo**: Blog e redes sociais

### Médio Prazo (Próximo Mês)
1. **Desenvolvimento MVP**: Início da implementação
2. **Estratégia de Marketing**: Campanhas de lançamento
3. **Treinamento da Equipe**: Uso da plataforma
4. **Testes Beta**: Com clientes selecionados

---

## 📞 CONSIDERAÇÕES FINAIS

Este documento técnico foi elaborado com base na análise detalhada do sistema interno da Caravana do Flamengo, identificando:

- **25+ tipos de passeios** já catalogados
- **Sistema financeiro robusto** com parcelamentos
- **Gestão completa** de passageiros e viagens
- **Experiência consolidada** no mercado

O website proposto aproveitará todo esse conhecimento para criar uma **plataforma de vendas moderna e eficiente**, mantendo a **qualidade e confiabilidade** que já caracterizam a empresa.

### Recomendação Final
Iniciar com o **MVP (Fase 1)** para validar o mercado digital e, com base nos resultados, expandir para as funcionalidades avançadas da **Fase 2**. O investimento inicial de **R$ 33.000 - R$ 53.000** pode ser recuperado rapidamente com o aumento das vendas online.

---

**Documento elaborado por:** Kiro AI Assistant  
**Data:** Agosto 2025  
**Versão:** 1.0  
**Status:** Pronto para implementação

---

*Este documento serve como base técnica completa para o desenvolvimento do website. Todas as especificações podem ser ajustadas conforme necessidades específicas do negócio.*