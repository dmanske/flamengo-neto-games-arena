# Implementation Plan - Sistema de Cadastramento Facial

- [ ] 1. Preparar estrutura do banco de dados
  - Criar migração SQL para adicionar campo `cadastro_facial` na tabela `clientes`
  - Executar migração no Supabase
  - Verificar se campo foi adicionado corretamente
  - _Requirements: 1.3, 4.3_

- [x] 2. Atualizar tipos e schemas TypeScript
  - [x] 2.1 Atualizar interface `Cliente` em `src/types/entities.ts`
    - Adicionar campo `cadastro_facial?: boolean`
    - _Requirements: 1.1, 4.1_
  
  - [x] 2.2 Atualizar `ClienteFormSchema.ts`
    - Adicionar validação `cadastro_facial: z.boolean().optional()`
    - Atualizar interface `ClienteFormData`
    - _Requirements: 4.1, 4.2_

- [x] 3. Implementar checkbox no formulário de cadastro
  - [x] 3.1 Modificar `ClienteForm.tsx`
    - Adicionar campo `cadastro_facial` nos defaultValues
    - Incluir campo no objeto `clienteData` antes de salvar
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 3.2 Criar seção de cadastramento facial na UI
    - Adicionar checkbox após `PersonalInfoFields`
    - Implementar label "Possui cadastramento facial"
    - Adicionar texto explicativo discreto
    - _Requirements: 4.1_

- [x] 4. Implementar indicador na lista de passageiros
  - [x] 4.1 Modificar `PassageiroRow.tsx`
    - Adicionar exibição do status abaixo do CPF
    - Implementar lógica para mostrar "✓ Facial OK" ou "⚠ Facial pendente"
    - Aplicar cores adequadas (verde/amarelo)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 4.2 Criar componente `CadastroFacialIndicator` (opcional)
    - Componente reutilizável para exibir status
    - Props para controlar tamanho e estado
    - _Requirements: 2.2, 2.3_

- [ ]* 5. Criar testes unitários
  - [ ]* 5.1 Testar ClienteForm com novo campo
    - Verificar se checkbox funciona corretamente
    - Testar salvamento do campo
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 5.2 Testar PassageiroRow com indicador
    - Testar exibição dos diferentes estados
    - Verificar cores e textos corretos
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Validar funcionamento end-to-end
  - [x] 6.1 Testar fluxo completo de cadastro
    - Criar cliente novo com cadastramento facial marcado
    - Verificar se informação é salva no banco
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.2 Testar exibição na lista de passageiros
    - Adicionar cliente com cadastro facial a uma viagem
    - Verificar se status aparece corretamente na lista
    - Testar cliente sem cadastro facial
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_
  
  - [x] 6.3 Testar edição de cliente existente
    - Editar cliente e alterar status do cadastramento facial
    - Verificar se mudança é refletida na lista de passageiros
    - _Requirements: 4.2, 3.3_

- [x] 7. Documentar e finalizar
  - Atualizar documentação sobre o novo campo
  - Verificar se não há regressões no sistema
  - Confirmar que funcionalidade não interfere em outras partes
  - _Requirements: 3.4_