# Especificação: Sistema de Personalização Completa de Relatórios

## Introdução

Esta especificação visa criar um sistema de personalização granular para relatórios de viagens, permitindo que o usuário escolha exatamente quais elementos, dados e seções devem aparecer no relatório final.

O sistema atual possui filtros rápidos predefinidos, mas esta melhoria focará em dar controle total ao usuário sobre cada aspecto do relatório - desde informações do header até dados específicos de cada passageiro, ônibus e seção.

## Requisitos

### Requisito 1: Personalização Completa do Header do Relatório

**User Story:** Como usuário do sistema, eu quero escolher exatamente quais informações aparecem no cabeçalho do relatório, para que eu possa criar relatórios com as informações mais relevantes para cada situação.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização do header THEN o sistema SHALL permitir escolher quais dados da viagem exibir
2. WHEN o usuário configurar dados do jogo THEN o sistema SHALL permitir escolher: adversário, data/hora do jogo, local do jogo (casa/fora), nome do estádio
3. WHEN o usuário configurar dados da viagem THEN o sistema SHALL permitir escolher: status da viagem, valor padrão, setor padrão, rota, tipo de pagamento
4. WHEN o usuário configurar logos THEN o sistema SHALL permitir escolher: logo da empresa, logo do adversário, logo do Flamengo, posicionamento dos logos
5. WHEN o usuário configurar informações da empresa THEN o sistema SHALL permitir escolher: nome, telefone, email, endereço, site, redes sociais
6. WHEN o usuário configurar totais THEN o sistema SHALL permitir escolher: total de ingressos, total de passageiros, total arrecadado, data/hora de geração
7. WHEN o usuário configurar texto personalizado THEN o sistema SHALL permitir adicionar: título personalizado, subtítulo, observações, instruções especiais
8. WHEN o usuário configurar header THEN o sistema SHALL mostrar preview em tempo real das mudanças

### Requisito 2: Personalização Completa da Lista de Passageiros

**User Story:** Como usuário do sistema, eu quero escolher exatamente quais colunas e dados aparecem na lista de passageiros, para que eu possa criar relatórios com apenas as informações necessárias.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização da lista THEN o sistema SHALL permitir escolher quais colunas exibir
2. WHEN o usuário configurar dados pessoais THEN o sistema SHALL permitir escolher: número sequencial, nome, CPF, data nascimento, idade, telefone, email
3. WHEN o usuário configurar dados de localização THEN o sistema SHALL permitir escolher: cidade, estado, endereço, número, bairro, CEP, complemento, cidade embarque
4. WHEN o usuário configurar dados de viagem THEN o sistema SHALL permitir escolher: setor Maracanã, ônibus alocado, assento, foto do passageiro
5. WHEN o usuário configurar dados financeiros THEN o sistema SHALL permitir escolher: status pagamento, forma pagamento, valor pago, desconto, valor bruto, parcelas
6. WHEN o usuário configurar dados de crédito THEN o sistema SHALL permitir escolher: pago por crédito, valor crédito utilizado, origem do crédito
7. WHEN o usuário configurar dados de passeios THEN o sistema SHALL permitir escolher: passeios selecionados, status dos passeios, valores cobrados por passeio
8. WHEN o usuário configurar dados adicionais THEN o sistema SHALL permitir escolher: responsável do ônibus, observações, como conheceu a empresa
9. WHEN o usuário configurar colunas THEN o sistema SHALL permitir reordenar as colunas por drag-and-drop
10. WHEN o usuário configurar colunas THEN o sistema SHALL permitir definir largura personalizada para cada coluna

### Requisito 3: Personalização Completa da Lista de Ônibus

**User Story:** Como usuário do sistema, eu quero escolher exatamente quais informações dos ônibus aparecem no relatório, para que eu possa criar listas específicas para diferentes finalidades.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização de ônibus THEN o sistema SHALL permitir escolher quais dados dos ônibus exibir
2. WHEN o usuário configurar dados básicos THEN o sistema SHALL permitir escolher: número identificação, tipo ônibus, empresa, capacidade, lugares extras
3. WHEN o usuário configurar dados de transfer THEN o sistema SHALL permitir escolher: nome do tour, rota de transfer, placa do veículo, motorista
4. WHEN o usuário configurar dados de ocupação THEN o sistema SHALL permitir escolher: total de passageiros, passageiros confirmados, vagas disponíveis, taxa de ocupação
5. WHEN o usuário configurar dados técnicos THEN o sistema SHALL permitir escolher: informações de WiFi (rede, senha), foto do ônibus, observações especiais
6. WHEN o usuário configurar exibição THEN o sistema SHALL permitir mostrar/ocultar lista detalhada de passageiros por ônibus
7. WHEN o usuário configurar layout THEN o sistema SHALL permitir escolher se cada ônibus aparece em página separada ou na mesma página

### Requisito 4: Personalização Completa das Seções de Resumo e Estatísticas

**User Story:** Como usuário do sistema, eu quero escolher quais seções de resumo e estatísticas aparecem no relatório, para que eu possa focar apenas nas informações relevantes.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização de seções THEN o sistema SHALL permitir escolher quais seções incluir
2. WHEN o usuário configurar seções financeiras THEN o sistema SHALL permitir escolher: resumo financeiro geral, receita por categoria (viagem/passeios), valores pagos/pendentes, descontos aplicados
3. WHEN o usuário configurar seções de distribuição THEN o sistema SHALL permitir escolher: distribuição por setor do Maracanã, distribuição por ônibus, distribuição por cidade/estado
4. WHEN o usuário configurar seções de passeios THEN o sistema SHALL permitir escolher: estatísticas de passeios, totais por passeio, passeios & faixas etárias, custos operacionais
5. WHEN o usuário configurar seções demográficas THEN o sistema SHALL permitir escolher: faixas etárias, distribuição por gênero, estatísticas de contato
6. WHEN o usuário configurar seções de pagamento THEN o sistema SHALL permitir escolher: formas de pagamento, status de pagamento, parcelamentos, créditos utilizados
7. WHEN o usuário configurar seções de ingressos THEN o sistema SHALL permitir escolher: total de ingressos, ingressos por setor, ingressos por faixa etária
8. WHEN o usuário configurar seções THEN o sistema SHALL permitir reordenar as seções no relatório
9. WHEN o usuário configurar seções THEN o sistema SHALL permitir personalizar título e conteúdo de cada seção
10. WHEN o usuário configurar seções THEN o sistema SHALL permitir incluir/excluir passageiros não alocados em ônibus

### Requisito 5: Personalização Completa de Dados de Passeios

**User Story:** Como usuário do sistema, eu quero personalizar completamente como os dados de passeios aparecem no relatório, para que eu possa criar relatórios específicos para diferentes finalidades de passeios.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização de passeios THEN o sistema SHALL permitir escolher quais dados de passeios exibir
2. WHEN o usuário configurar lista de passeios THEN o sistema SHALL permitir escolher: passeios pagos, passeios gratuitos, todos os passeios disponíveis
3. WHEN o usuário configurar dados por passeio THEN o sistema SHALL permitir escolher: nome do passeio, categoria (pago/gratuito), valor cobrado, custo operacional
4. WHEN o usuário configurar estatísticas THEN o sistema SHALL permitir escolher: total de participantes por passeio, receita por passeio, margem de lucro
5. WHEN o usuário configurar agrupamentos THEN o sistema SHALL permitir escolher: agrupar por categoria, agrupar por valor, agrupar por popularidade
6. WHEN o usuário configurar exibição na lista THEN o sistema SHALL permitir escolher: mostrar passeios como coluna separada, mostrar como texto concatenado, mostrar com ícones
7. WHEN o usuário configurar filtros de passeios THEN o sistema SHALL permitir escolher: apenas passageiros com passeios, apenas passeios específicos, excluir passeios específicos
8. WHEN o usuário configurar detalhamento THEN o sistema SHALL permitir escolher: status do passeio por passageiro, valores individuais cobrados, observações específicas

### Requisito 6: Personalização de Formatação e Estilo

**User Story:** Como usuário do sistema, eu quero personalizar a aparência e formatação do relatório, para que eu possa criar documentos com a identidade visual adequada.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização de estilo THEN o sistema SHALL permitir escolher tamanho da fonte para diferentes seções
2. WHEN o usuário configurar formatação THEN o sistema SHALL permitir escolher cores para headers e seções
3. WHEN o usuário configurar formatação THEN o sistema SHALL permitir escolher espaçamento entre seções
4. WHEN o usuário configurar formatação THEN o sistema SHALL permitir adicionar bordas e separadores personalizados
5. WHEN o usuário configurar formatação THEN o sistema SHALL permitir escolher orientação da página (retrato/paisagem)
6. WHEN o usuário configurar formatação THEN o sistema SHALL permitir adicionar marca d'água ou logo de fundo
7. WHEN o usuário configurar layout THEN o sistema SHALL permitir escolher: quebras de página automáticas, espaçamento entre tabelas, margens personalizadas
8. WHEN o usuário configurar cores THEN o sistema SHALL permitir escolher: esquema de cores por seção, cores alternadas para linhas de tabela, cores de destaque

### Requisito 7: Sistema de Templates Personalizados

**User Story:** Como usuário frequente do sistema, eu quero salvar configurações completas de personalização como templates, para que eu possa reutilizar layouts específicos rapidamente.

#### Acceptance Criteria

1. WHEN o usuário configurar personalização completa THEN o sistema SHALL oferecer opção "Salvar como Template"
2. WHEN o usuário salvar template THEN o sistema SHALL solicitar nome, descrição e categoria do template
3. WHEN o usuário acessar templates THEN o sistema SHALL listar todos os templates salvos organizados por categoria
4. WHEN o usuário aplicar template THEN o sistema SHALL carregar todas as configurações de personalização salvas
5. WHEN o usuário quiser editar template THEN o sistema SHALL permitir atualizar, duplicar ou excluir templates existentes
6. WHEN o usuário salvar template THEN o sistema SHALL incluir: configurações de header, colunas, seções, formatação e filtros

### Requisito 8: Interface de Personalização Intuitiva

**User Story:** Como usuário do sistema, eu quero uma interface de personalização organizada e fácil de usar, para que eu possa configurar relatórios rapidamente sem confusão.

#### Acceptance Criteria

1. WHEN o usuário acessar personalização THEN o sistema SHALL organizar opções em abas categorizadas (Header, Passageiros, Ônibus, Seções, Estilo)
2. WHEN o usuário configurar personalização THEN o sistema SHALL mostrar preview em tempo real das mudanças
3. WHEN o usuário aplicar configurações THEN o sistema SHALL mostrar resumo visual das personalizações ativas
4. WHEN o usuário quiser resetar THEN o sistema SHALL oferecer opções "Resetar Tudo", "Resetar Categoria" e "Voltar ao Padrão"
5. WHEN o usuário usar personalização complexa THEN o sistema SHALL manter performance adequada (< 2 segundos)
6. WHEN o usuário configurar elementos THEN o sistema SHALL usar drag-and-drop para reordenação intuitiva

### Requisito 9: Compartilhamento e Exportação de Configurações

**User Story:** Como gestor, eu quero compartilhar configurações de personalização com minha equipe, para que todos possam usar os mesmos padrões de relatórios.

#### Acceptance Criteria

1. WHEN o usuário configurar personalização THEN o sistema SHALL permitir exportar configuração como arquivo JSON
2. WHEN o usuário importar arquivo de configuração THEN o sistema SHALL validar e aplicar todas as personalizações
3. WHEN o usuário compartilhar configuração THEN o sistema SHALL gerar URL com parâmetros de personalização
4. WHEN o usuário acessar URL com configuração THEN o sistema SHALL aplicar automaticamente todas as personalizações
5. WHEN o usuário exportar configuração THEN o sistema SHALL incluir metadados (data, usuário, descrição, versão)
6. WHEN o usuário importar configuração THEN o sistema SHALL verificar compatibilidade e alertar sobre diferenças