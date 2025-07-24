# 🏢 Setup da Logo da Empresa

Este guia explica como configurar e usar a logo da sua empresa no sistema de cadastro público.

## 📋 O que foi implementado

### 🗄️ Banco de Dados
- **Tabela `empresa_config`**: Armazena todas as informações da empresa
- **Bucket `logos`**: Storage para arquivos de logo
- **Políticas de segurança**: Controle de acesso aos arquivos

### 🎨 Interface
- **Componente `EmpresaConfig`**: Formulário completo para gerenciar dados da empresa
- **Componente `LogoEmpresa`**: Exibe a logo em diferentes tamanhos
- **Hook `useEmpresa`**: Facilita acesso aos dados da empresa
- **Página de configurações**: Interface administrativa

### 🔗 Integração
- **Cadastro público**: Logo aparece automaticamente no topo
- **Menu administrativo**: Link para configurações da empresa

## 🚀 Como configurar

### 1. Executar o script SQL
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: database/setup_empresa_logo.sql
```

### 2. Acessar as configurações
1. Faça login no painel administrativo
2. Vá para **Configurações** no menu lateral
3. Ou acesse diretamente: `/dashboard/empresa/configuracoes`

### 3. Configurar a empresa
1. **Upload da logo**: Clique em "Escolher arquivo" e selecione sua logo
2. **Dados básicos**: Preencha nome, CNPJ, contatos
3. **Endereço**: Complete as informações de localização
4. **Redes sociais**: Adicione links das redes sociais
5. **Descrição**: Escreva sobre sua empresa
6. Clique em **Salvar Configurações**

## 📁 Arquivos criados

### Banco de Dados
- `database/create_empresa_table.sql` - Criação da tabela
- `database/setup_empresa_logo.sql` - Setup completo

### Componentes React
- `src/components/empresa/EmpresaConfig.tsx` - Formulário de configuração
- `src/components/empresa/LogoEmpresa.tsx` - Componente para exibir logo
- `src/hooks/useEmpresa.ts` - Hook para acessar dados
- `src/pages/EmpresaConfigPage.tsx` - Página de configurações

### Integrações
- Modificado: `src/components/cadastro-publico/PublicRegistrationForm.tsx`
- Modificado: `src/components/layout/MainLayout.tsx`
- Modificado: `src/App.tsx`

## 🎯 Funcionalidades

### Upload de Logo
- **Formatos aceitos**: JPG, PNG, GIF, WebP, SVG
- **Tamanho máximo**: 5MB
- **Storage**: Supabase Storage (bucket `logos`)
- **Acesso**: Público (URLs diretas)

### Exibição da Logo
```tsx
// Exemplo de uso do componente
<LogoEmpresa 
  size="xl"        // sm, md, lg, xl
  showName={true}   // Mostrar nome da empresa
  className="mb-4"  // Classes CSS customizadas
/>
```

### Dados da Empresa
- Nome oficial e nome fantasia
- CNPJ, e-mail, telefones
- Endereço completo
- Site e redes sociais
- Descrição da empresa

## 🔧 Personalização

### Tamanhos da Logo
```tsx
const sizeClasses = {
  sm: 'h-8 w-8',   // 32x32px
  md: 'h-12 w-12', // 48x48px
  lg: 'h-16 w-16', // 64x64px
  xl: 'h-24 w-24'  // 96x96px
};
```

### Fallback sem Logo
Se não houver logo, exibe um círculo com a primeira letra do nome da empresa.

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Desktop**: Logo grande com nome
- **Mobile**: Logo menor, layout adaptado
- **Tablet**: Tamanho intermediário

## 🔒 Segurança

### Políticas de Acesso
- **Upload**: Apenas usuários autenticados
- **Visualização**: Público (necessário para cadastro público)
- **Edição/Exclusão**: Apenas usuários autenticados

### Validações
- Tipos de arquivo permitidos
- Tamanho máximo de 5MB
- Sanitização de dados de entrada

## 🧪 Testando

### 1. Teste o Upload
1. Acesse `/dashboard/empresa/configuracoes`
2. Faça upload de uma logo
3. Preencha os dados básicos
4. Salve as configurações

### 2. Teste o Cadastro Público
1. Acesse `/cadastro-publico`
2. Verifique se a logo aparece no topo
3. Confirme se o nome da empresa está correto

### 3. Teste Responsividade
1. Teste em diferentes tamanhos de tela
2. Verifique se a logo se adapta corretamente

## 🐛 Troubleshooting

### Logo não aparece
1. Verifique se o arquivo foi enviado corretamente
2. Confirme se as políticas do bucket estão ativas
3. Teste a URL da logo diretamente no navegador

### Erro de upload
1. Verifique o tamanho do arquivo (máx 5MB)
2. Confirme o formato (JPG, PNG, GIF, WebP, SVG)
3. Verifique se o usuário está autenticado

### Dados não salvam
1. Verifique a conexão com o banco
2. Confirme se a tabela `empresa_config` existe
3. Verifique os logs do console

## 📈 Próximas melhorias

- [ ] Múltiplas logos (clara/escura)
- [ ] Redimensionamento automático
- [ ] Compressão de imagens
- [ ] Histórico de logos
- [ ] Preview antes do upload
- [ ] Integração com outras páginas

## 🎉 Pronto!

Sua logo agora aparece no cadastro público e você pode gerenciar todas as informações da empresa através do painel administrativo.

**Acesse**: `/dashboard/empresa/configuracoes` para começar!