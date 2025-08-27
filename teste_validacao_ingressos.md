# Teste de Validação - Ingressos Duplicados

## ✅ Implementações Realizadas

### 1. Validação no Backend (useIngressos.ts)
- **Criação**: Verifica se cliente já tem ingresso na mesma viagem antes de criar
- **Edição**: Verifica duplicação ao alterar cliente ou viagem
- **Mensagens**: Exibe toast de erro específico para duplicação

### 2. Validação no Frontend (IngressoFormModal.tsx)
- **Verificação em tempo real**: Monitora mudanças nos campos cliente_id e viagem_id
- **Aviso visual**: Exibe alerta vermelho quando detecta duplicação
- **Botão desabilitado**: Impede submissão quando há conflito
- **Exclusão na edição**: Não valida contra o próprio ingresso sendo editado

## 🧪 Cenários de Teste

### Teste 1: Criar Ingresso Duplicado
1. Abrir "Novo Ingresso"
2. Selecionar um cliente
3. Selecionar uma viagem
4. Salvar o ingresso
5. Tentar criar outro ingresso com o mesmo cliente e viagem
6. **Resultado esperado**: Erro "Este cliente já possui ingresso para esta viagem"

### Teste 2: Validação Visual em Tempo Real
1. Abrir "Novo Ingresso"
2. Selecionar um cliente que já tem ingresso
3. Selecionar a viagem onde ele já tem ingresso
4. **Resultado esperado**: Aviso vermelho aparece imediatamente
5. **Resultado esperado**: Botão "Cadastrar" fica desabilitado

### Teste 3: Editar Ingresso Sem Conflito
1. Editar um ingresso existente
2. Alterar dados que não causam duplicação
3. **Resultado esperado**: Salva normalmente

### Teste 4: Editar Ingresso Com Conflito
1. Editar um ingresso existente
2. Alterar cliente para um que já tem ingresso na mesma viagem
3. **Resultado esperado**: Erro ao tentar salvar

## 🔍 Pontos de Verificação

- [ ] Validação funciona na criação
- [ ] Validação funciona na edição
- [ ] Aviso visual aparece em tempo real
- [ ] Botão fica desabilitado com conflito
- [ ] Mensagens de erro são claras
- [ ] Performance não é afetada

## 📝 Observações

- A validação só se aplica quando há viagem selecionada (viagem_id não nulo)
- Ingressos sem viagem vinculada podem ter o mesmo cliente múltiplas vezes
- A validação exclui o próprio ingresso na edição (usando .neq('id', id))