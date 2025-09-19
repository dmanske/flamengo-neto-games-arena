# 🚌 Sistema de Lista de Presença por Ônibus

## 📋 Visão Geral

O sistema de Lista de Presença por Ônibus permite que administradores gerem links específicos para cada ônibus de uma viagem, possibilitando que responsáveis/guias acessem uma interface dedicada apenas aos passageiros do seu ônibus específico.

## ✨ Funcionalidades Principais

### Para Administradores
- **Geração de Links**: Criar links específicos para cada ônibus
- **Cópia Rápida**: Copiar links para área de transferência
- **Estatísticas**: Ver contagem de passageiros por ônibus
- **Integração**: Acesso direto na página de detalhes da viagem

### Para Guias/Responsáveis
- **Interface Dedicada**: Ver apenas passageiros do seu ônibus
- **Marcar Presença**: Controle completo de presença
- **Filtros e Busca**: Encontrar passageiros rapidamente
- **Mobile-First**: Otimizado para smartphones
- **Estatísticas**: Resumo financeiro e de presença

## 🚀 Como Usar

### 1. Gerando Links (Administrador)

1. Acesse **Detalhes da Viagem**
2. Na aba **Passageiros**, encontre a seção **"Links por Ônibus"**
3. Clique em **"Copiar Link"** para o ônibus desejado
4. Compartilhe o link com o responsável/guia do ônibus

### 2. Acessando Lista Específica (Guia)

1. Acesse o link fornecido pelo administrador
2. Faça login se necessário
3. Visualize apenas os passageiros do seu ônibus
4. Use filtros e busca para encontrar passageiros
5. Marque presença conforme necessário

## 🔗 Estrutura de URLs

```
# Lista geral (todos os ônibus)
/dashboard/viagens/{viagemId}/lista-presenca

# Lista específica por ônibus
/dashboard/viagens/{viagemId}/lista-presenca/onibus/{onibusId}
```

## 📱 Interface Mobile

O sistema foi desenvolvido com **mobile-first**, garantindo:
- ✅ Botões otimizados para toque
- ✅ Layout responsivo
- ✅ Cards empilhados em telas pequenas
- ✅ Navegação simplificada

## 🔒 Segurança

- **Autenticação obrigatória**: Todos os acessos requerem login
- **Validação de parâmetros**: UUIDs validados
- **Verificação de permissões**: Acesso controlado
- **Tratamento de erros**: Mensagens claras para problemas

## 📊 Informações Exibidas

### Cabeçalho
- Informações do jogo (adversário, data, logos)
- Dados do ônibus (número, tipo, empresa, capacidade)
- Taxa de presença em tempo real

### Estatísticas
- Total de passageiros
- Presentes/Pendentes/Ausentes
- Resumo financeiro (pagos, pendentes, cortesias)
- Responsáveis do ônibus

### Lista de Passageiros
- Foto e dados pessoais
- Status de pagamento detalhado
- Passeios contratados
- Botões de presença
- Destaque para responsáveis

## 🎯 Filtros Disponíveis

- **Busca**: Nome, CPF, telefone
- **Status de Presença**: Presente, Pendente, Ausente
- **Cidade de Embarque**: Filtro por cidade
- **Setor no Maracanã**: Filtro por setor
- **Passeios**: Com/sem passeios ou passeio específico

## 🔄 Atualizações em Tempo Real

- **Debounce na busca**: 300ms de delay
- **Loading states**: Indicadores visuais
- **Feedback imediato**: Toasts de confirmação
- **Optimistic updates**: UI responsiva

## 🛠️ Componentes Técnicos

### Hooks
- `useListaPresencaOnibus`: Hook principal com dados e funcionalidades
- `useDebounce`: Otimização de performance na busca

### Componentes
- `OnibusHeader`: Cabeçalho com informações do ônibus
- `EstatisticasOnibus`: Cards de estatísticas detalhadas
- `FiltrosOnibus`: Sistema de filtros e busca
- `PassageirosOnibusGrid`: Grid de passageiros com presença
- `LinksOnibusSection`: Seção administrativa para gerar links

### Páginas
- `ListaPresencaOnibus`: Página principal da lista específica

## 📈 Performance

- **Lazy loading**: Carregamento sob demanda
- **Code splitting**: Separação de código
- **Debounce**: Otimização de busca
- **Memoização**: Cálculos otimizados

## 🐛 Tratamento de Erros

### Cenários Cobertos
- Ônibus não encontrado
- Viagem não encontrada
- Parâmetros inválidos
- Problemas de conectividade
- Erros de autenticação

### Mensagens de Erro
- Claras e específicas
- Sugestões de solução
- Redirecionamentos adequados

## 🔧 Configuração

### Dependências
- React Router para navegação
- Supabase para dados
- Tailwind CSS para styling
- shadcn/ui para componentes
- Sonner para toasts

### Variáveis de Ambiente
Utiliza as mesmas configurações do Supabase existentes no projeto.

## 📝 Exemplo de Uso

```typescript
// Gerar link para ônibus específico
const link = `/dashboard/viagens/${viagemId}/lista-presenca/onibus/${onibusId}`;

// Compartilhar com guia
navigator.clipboard.writeText(link);
```

## 🎉 Benefícios

### Para Administradores
- **Controle granular**: Links específicos por ônibus
- **Facilidade**: Geração e cópia rápida de links
- **Visibilidade**: Estatísticas por ônibus

### Para Guias
- **Foco**: Apenas passageiros do seu ônibus
- **Simplicidade**: Interface limpa e intuitiva
- **Mobilidade**: Uso em smartphones durante embarque

### Para Passageiros
- **Transparência**: Responsáveis identificados
- **Organização**: Melhor controle de embarque

## 🚀 Próximos Passos

- [ ] Notificações push para guias
- [ ] Relatórios de presença por ônibus
- [ ] Integração com WhatsApp
- [ ] Modo offline para emergências

---

**Desenvolvido com ❤️ para otimizar o controle de presença em viagens do Flamengo! 🔴⚫**