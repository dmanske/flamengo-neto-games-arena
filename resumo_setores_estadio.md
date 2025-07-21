# Atualização dos Setores do Estádio

## Mudanças Implementadas:

### 1. ✅ Novos Setores Adicionados
- **"Setor padrão do estádio visitante"** - Para jogos fora do Rio de Janeiro
- **"Sem ingresso"** - Para viagens sem ingresso incluído
- Mantidos os setores do Maracanã: Norte, Sul, Leste, Oeste, Maracanã Mais

### 2. ✅ Lógica Automática Implementada
- **Quando local = "Rio de Janeiro"**: Sugere setores do Maracanã
- **Quando local ≠ "Rio de Janeiro"**: Sugere automaticamente "Setor padrão do estádio visitante"
- **Mudança automática**: Se você mudar o local, o setor se ajusta automaticamente

### 3. ✅ Dicas Visuais
- Texto explicativo abaixo do campo de setor
- Orientação contextual baseada no local selecionado

### 4. ✅ SQL para Atualizar Dados Existentes
Arquivo criado: `update_setores_fora_rio.sql`

## Como Usar o SQL:

1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute o conteúdo do arquivo `update_setores_fora_rio.sql`**

O SQL fará:
- Mostrar viagens fora do Rio com setores do Maracanã
- Atualizar automaticamente para "Setor padrão do estádio visitante"
- Mostrar o resultado final

## Comportamento Esperado:

### No Cadastro:
- **Local = Rio de Janeiro** → Setor padrão = "Norte"
- **Local = Outras cidades** → Setor padrão = "Setor padrão do estádio visitante"
- **Mudança de local** → Setor se ajusta automaticamente

### Opções Disponíveis:
1. **Norte, Sul, Leste, Oeste, Maracanã Mais** (para jogos no Rio)
2. **Setor padrão do estádio visitante** (para jogos fora do Rio)
3. **Sem ingresso** (para qualquer situação sem ingresso)

## Teste:
1. Cadastre uma viagem com local "São Paulo" → Setor deve sugerir "Setor padrão do estádio visitante"
2. Mude o local para "Rio de Janeiro" → Setor deve mudar para "Norte"
3. Execute o SQL para atualizar viagens existentes