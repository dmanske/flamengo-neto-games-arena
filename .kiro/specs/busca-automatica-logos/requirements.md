# Especificação: Busca Automática de Logos dos Adversários

## Introdução

Esta funcionalidade implementará um sistema de busca automática de logos dos times adversários quando o usuário digitar o nome do time no formulário de cadastro de ingressos. O sistema reutilizará a tabela `adversarios` existente (já usada no cadastro de viagens) e implementará busca inteligente com debounce para melhorar a experiência do usuário.

## Requisitos

### Requisito 1

**User Story:** Como administrador do sistema, eu quero que o logo do adversário seja buscado automaticamente da tabela de adversários quando eu digitar o nome do time, para que eu não precise inserir a URL manualmente.

#### Critérios de Aceitação

1. QUANDO o usuário digitar o nome de um time no campo "adversário" ENTÃO o sistema DEVE buscar na tabela `adversarios` por nomes similares
2. QUANDO encontrar adversários correspondentes ENTÃO o sistema DEVE exibir uma prévia do logo automaticamente
3. QUANDO não encontrar adversários correspondentes ENTÃO o sistema DEVE manter o campo de URL manual
4. QUANDO o usuário selecionar um adversário sugerido ENTÃO o sistema DEVE preencher automaticamente o nome e logo

### Requisito 2

**User Story:** Como administrador do sistema, eu quero que a busca de adversários seja rápida e responsiva, para que não haja demora no cadastro de ingressos.

#### Critérios de Aceitação

1. QUANDO o usuário parar de digitar por 300ms ENTÃO o sistema DEVE iniciar a busca na tabela `adversarios`
2. QUANDO a busca estiver em andamento ENTÃO o sistema DEVE exibir um indicador de carregamento sutil
3. QUANDO a busca retornar resultados ENTÃO o sistema DEVE exibir sugestões em dropdown
4. QUANDO houver erro na busca ENTÃO o sistema DEVE falhar silenciosamente e permitir entrada manual

### Requisito 3

**User Story:** Como administrador do sistema, eu quero que o sistema reconheça variações nos nomes dos times, para que a busca funcione mesmo com grafias diferentes.

#### Critérios de Aceitação

1. QUANDO o usuário digitar nomes com acentos ou sem acentos ENTÃO o sistema DEVE encontrar adversários correspondentes usando busca ILIKE
2. QUANDO o usuário digitar abreviações comuns (ex: "Flu" para "Fluminense") ENTÃO o sistema DEVE reconhecer usando busca parcial
3. QUANDO o usuário digitar nomes em maiúscula ou minúscula ENTÃO o sistema DEVE ser case-insensitive
4. QUANDO o usuário digitar nomes com espaços extras ENTÃO o sistema DEVE normalizar e buscar corretamente

### Requisito 4

**User Story:** Como administrador do sistema, eu quero que as sugestões de adversários sejam apresentadas de forma clara e visual, para facilitar a seleção.

#### Critérios de Aceitação

1. QUANDO o sistema encontrar adversários correspondentes ENTÃO deve exibir uma lista com nome e logo
2. QUANDO o usuário passar o mouse sobre uma sugestão ENTÃO deve destacar visualmente a opção
3. QUANDO o logo de um adversário não carregar ENTÃO deve exibir um placeholder
4. QUANDO não houver sugestões ENTÃO deve permitir entrada manual livre

### Requisito 5

**User Story:** Como administrador do sistema, eu quero poder editar manualmente o logo mesmo após selecionar um adversário sugerido, para ter controle total sobre as imagens utilizadas.

#### Critérios de Aceitação

1. QUANDO um adversário for selecionado das sugestões ENTÃO o usuário DEVE poder editar manualmente a URL do logo
2. QUANDO o usuário editar manualmente a URL ENTÃO o sistema DEVE atualizar a prévia imediatamente
3. QUANDO o usuário limpar o campo de logo ENTÃO deve voltar ao estado inicial sem logo
4. QUANDO o usuário digitar uma URL inválida ENTÃO deve exibir placeholder de erro na prévia

### Requisito 6

**User Story:** Como desenvolvedor do sistema, eu quero que a funcionalidade seja performática e não impacte a velocidade do formulário, para manter uma boa experiência do usuário.

#### Critérios de Aceitação

1. QUANDO múltiplas buscas forem iniciadas rapidamente ENTÃO o sistema DEVE cancelar buscas anteriores (debounce)
2. QUANDO o componente for desmontado ENTÃO todas as requisições pendentes DEVEM ser canceladas
3. QUANDO houver cache de adversários ENTÃO o sistema DEVE reutilizar dados já carregados
4. QUANDO a busca falhar ENTÃO não DEVE impactar o funcionamento do resto do formulário

### Requisito 7

**User Story:** Como administrador do sistema, eu quero poder editar o logo do adversário diretamente no card do jogo, para corrigir logos que não carregaram ou estão incorretos.

#### Critérios de Aceitação

1. QUANDO eu clicar no logo do adversário no card do jogo ENTÃO deve abrir um modal de edição
2. QUANDO eu editar o logo no modal ENTÃO deve atualizar todos os ingressos daquele jogo
3. QUANDO eu salvar a alteração ENTÃO deve refletir imediatamente no card
4. QUANDO o logo não carregar ENTÃO deve mostrar um ícone de edição visível

### Requisito 8

**User Story:** Como administrador do sistema, eu quero que a funcionalidade seja consistente com o sistema de viagens existente, para manter a uniformidade da aplicação.

#### Critérios de Aceitação

1. QUANDO um adversário for cadastrado no sistema de viagens ENTÃO deve estar disponível no sistema de ingressos
2. QUANDO um logo for atualizado na tabela adversários ENTÃO deve refletir em ambos os sistemas
3. QUANDO a busca não encontrar resultados ENTÃO deve permitir entrada livre como no sistema de viagens
4. QUANDO o usuário selecionar um adversário ENTÃO deve preencher os campos da mesma forma que no sistema de viagens