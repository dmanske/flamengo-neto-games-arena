# Requirements Document

## Introduction

Esta funcionalidade visa melhorar significativamente o sistema de busca e filtros na lista de passageiros, corrigindo problemas de busca que não encontra resultados corretos e adicionando filtros por passeios específicos. O sistema atual não consegue encontrar passageiros ao digitar termos como "lapa" e não possui filtros para passeios, limitando a capacidade de gerenciamento eficiente dos passageiros.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero que a busca funcione corretamente em todos os campos relevantes, para que eu possa encontrar passageiros digitando qualquer informação conhecida.

#### Acceptance Criteria

1. WHEN o usuário digita na barra de busca THEN o sistema SHALL buscar em: nome, telefone, email, cidade, setor_maracana, cidade_embarque, observações
2. WHEN o usuário digita "lapa" THEN o sistema SHALL encontrar passageiros que têm "Lapa" no setor_maracana ou nos passeios selecionados
3. WHEN o usuário digita parte de um nome THEN o sistema SHALL encontrar passageiros com nomes que contenham o termo (busca parcial)
4. WHEN o usuário digita um telefone parcial THEN o sistema SHALL encontrar passageiros com telefones que contenham os dígitos
5. WHEN a busca não encontra resultados THEN o sistema SHALL exibir mensagem clara "Nenhum passageiro encontrado para: [termo]"

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero filtrar passageiros por passeios específicos, para que eu possa gerenciar grupos de passageiros que selecionaram determinados passeios.

#### Acceptance Criteria

1. WHEN o usuário acessa os filtros THEN o sistema SHALL exibir dropdown "Filtrar por Passeio" com opções: "Todos", "Sem passeios", e lista de passeios disponíveis
2. WHEN o usuário seleciona "Sem passeios" THEN o sistema SHALL mostrar apenas passageiros que não selecionaram nenhum passeio
3. WHEN o usuário seleciona um passeio específico THEN o sistema SHALL mostrar apenas passageiros que selecionaram aquele passeio
4. WHEN o usuário seleciona "Todos" THEN o sistema SHALL mostrar todos os passageiros independente dos passeios

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero que os filtros funcionem em combinação, para que eu possa aplicar múltiplos critérios simultaneamente.

#### Acceptance Criteria

1. WHEN o usuário aplica filtro de status E filtro de passeio THEN o sistema SHALL mostrar passageiros que atendem AMBOS os critérios
2. WHEN o usuário aplica busca E filtros THEN o sistema SHALL mostrar passageiros que atendem TODOS os critérios aplicados
3. WHEN o usuário limpa um filtro THEN o sistema SHALL manter os outros filtros ativos e atualizar a lista
4. WHEN o usuário limpa todos os filtros THEN o sistema SHALL mostrar todos os passageiros da viagem

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero feedback visual claro sobre filtros aplicados, para que eu saiba quais critérios estão ativos e quantos resultados foram encontrados.

#### Acceptance Criteria

1. WHEN filtros estão aplicados THEN o sistema SHALL exibir badges indicando filtros ativos (ex: "Status: Pendente", "Passeio: Cristo Redentor")
2. WHEN a lista é filtrada THEN o sistema SHALL mostrar contador "Mostrando X de Y passageiros"
3. WHEN o usuário pode limpar filtros THEN o sistema SHALL exibir botão "Limpar filtros" visível
4. WHEN não há resultados THEN o sistema SHALL sugerir "Tente limpar alguns filtros ou alterar o termo de busca"

### Requirement 5

**User Story:** Como um desenvolvedor do sistema, eu quero otimizar a performance da busca e filtros, para que a interface responda rapidamente mesmo com muitos passageiros.

#### Acceptance Criteria

1. WHEN o usuário digita na busca THEN o sistema SHALL implementar debounce de 300ms para evitar buscas excessivas
2. WHEN os filtros são aplicados THEN o sistema SHALL processar no frontend sem requisições desnecessárias ao backend
3. WHEN a lista é grande THEN o sistema SHALL manter performance aceitável (< 100ms para filtrar)
4. WHEN os dados mudam THEN o sistema SHALL preservar filtros aplicados e reprocessar automaticamente

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero que a busca seja inteligente e tolerante a erros, para que eu encontre resultados mesmo com digitação imprecisa.

#### Acceptance Criteria

1. WHEN o usuário digita com acentos THEN o sistema SHALL encontrar resultados sem acentos e vice-versa
2. WHEN o usuário digita em maiúsculas/minúsculas THEN o sistema SHALL ser case-insensitive
3. WHEN o usuário digita com espaços extras THEN o sistema SHALL ignorar espaços desnecessários
4. WHEN o usuário digita termos parciais THEN o sistema SHALL encontrar correspondências no meio das palavras