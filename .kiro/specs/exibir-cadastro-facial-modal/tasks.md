# Implementation Plan

- [x] 1. Adicionar status do cadastro facial no modal de ingressos
  - Modificar o componente IngressoCard para incluir o status do cadastro facial abaixo do CPF
  - Reutilizar os componentes existentes (StatusCadastroFacial + useCadastroFacial)
  - Manter a mesma funcionalidade da lista de ônibus (clicável para alterar)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 1.1 Importar dependências necessárias no IngressoCard
  - Adicionar import do hook useCadastroFacial
  - Adicionar import do componente StatusCadastroFacial
  - _Requirements: 3.1_

- [x] 1.2 Implementar hook de cadastro facial no IngressoCard
  - Adicionar o hook useCadastroFacial com o ID do cliente
  - Configurar carregamento dos dados quando modal abrir
  - _Requirements: 3.2_

- [x] 1.3 Modificar layout da seção do cliente
  - Alterar estrutura do CPF para permitir o status abaixo
  - Posicionar o componente StatusCadastroFacial abaixo do CPF
  - _Requirements: 1.1, 3.3_

- [x] 1.4 Integrar componente StatusCadastroFacial
  - Passar as props necessárias (clienteId, cadastroFacialData, loading, onClick)
  - Configurar função de toggle para alterar status
  - _Requirements: 1.2, 1.3, 1.5, 2.1, 2.2_

- [x] 1.5 Testar funcionalidade completa
  - Verificar exibição do status no modal
  - Testar toggle clicando no status
  - Verificar persistência dos dados
  - _Requirements: 2.3, 2.4, 3.5_