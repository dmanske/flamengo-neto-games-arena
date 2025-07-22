# 🏦 Guia Completo - Módulo Financeiro

## 🚀 **PASSO 1: Configurar o Banco de Dados**

### Execute as migrações no Supabase:

1. **Acesse o Supabase Dashboard** do seu projeto
2. **Vá para SQL Editor**
3. **Cole e execute** o conteúdo do arquivo: `sql/financeiro/00_run_all_migrations.sql`
4. **Aguarde** a execução completa (deve mostrar "Tabelas criadas com sucesso!")

## 📱 **PASSO 2: Acessar o Módulo Financeiro**

### Agora você tem acesso completo:

1. **Entre no Dashboard** (`/dashboard`)
2. **Clique em "Financeiro"** no menu lateral (ícone 💰)
3. **No Dashboard Financeiro** você verá:
   - ✅ **Acesso Rápido** - Cards clicáveis para cada seção
   - ✅ **Ações Rápidas** - Botões para criar rapidamente
   - ✅ **Indicadores** - Métricas financeiras
   - ✅ **Gráficos** - Receitas vs Despesas
   - ✅ **Alertas** - Contas vencendo

## 🎯 **PASSO 3: Começar a Usar**

### **3.1 Receitas** (`/dashboard/financeiro/receitas`)
- ➕ **Cadastrar receitas** de viagens, vendas, etc.
- 🏷️ **Categorizar** automaticamente
- 🔗 **Vincular à viagens** específicas
- 📎 **Anexar comprovantes**
- 🔍 **Filtrar e buscar**

### **3.2 Despesas** (`/dashboard/financeiro/despesas`)
- ➕ **Cadastrar despesas** (combustível, aluguel, etc.)
- ⚠️ **Alertas automáticos** de vencimento
- ✅ **Marcar como pago**
- 🔗 **Vincular à viagens**
- 📊 **Controle de status**

### **3.3 Contas a Pagar** (`/dashboard/financeiro/contas-pagar`)
- 📅 **Contas recorrentes** (aluguel, seguros)
- 🔔 **Alertas por prazo** (vencidas, hoje, 7 dias, 30 dias)
- 🔄 **Criação automática** de próximas parcelas
- 💳 **Controle de pagamentos**

### **3.4 Relatórios** (`/dashboard/financeiro/relatorios`)
- 📈 **Gráficos interativos**
- 💰 **Lucratividade por viagem**
- 📊 **Análises personalizadas**
- 📄 **Exportação** (PDF, Excel, CSV)

### **3.5 Fluxo de Caixa** (`/dashboard/financeiro/fluxo-caixa`)
- 🔮 **Projeções futuras**
- 📊 **Comparativo realizado vs projetado**
- ⚠️ **Alertas de saldo negativo**
- 📈 **Tendências**

## 🎨 **FUNCIONALIDADES ESPECIAIS**

### **Integração com Viagens**
- Cada receita/despesa pode ser vinculada a uma viagem
- Análise de lucratividade por excursão
- Controle financeiro detalhado

### **Contas Recorrentes**
- Configure uma vez, o sistema cria automaticamente
- Frequências: mensal, trimestral, semestral, anual
- Quando paga, cria a próxima automaticamente

### **Categorias Inteligentes**
- Categorias pré-configuradas para turismo
- Cores e ícones para identificação visual
- Fácil filtragem e organização

### **Alertas Automáticos**
- 🔴 Contas vencidas
- 🟡 Vencem hoje
- 🔵 Vencem em 7 dias
- 🟢 Vencem em 30 dias

## 🚀 **FLUXO RECOMENDADO DE USO**

### **Configuração Inicial:**
1. ✅ Execute as migrações do banco
2. ✅ Configure contas recorrentes (aluguel, seguros)
3. ✅ Cadastre algumas categorias personalizadas se necessário

### **Uso Diário:**
1. 🌅 **Manhã:** Verifique alertas de vencimento
2. 💰 **Após viagens:** Registre receitas e despesas da viagem
3. 📊 **Fim do mês:** Analise relatórios e fluxo de caixa
4. 🎯 **Planejamento:** Use projeções para decisões

## 🔧 **Solução de Problemas**

### **Se não conseguir acessar as páginas:**
1. Verifique se executou as migrações do banco
2. Confirme que está logado no sistema
3. Limpe o cache do navegador
4. Verifique o console do navegador para erros

### **Se os dados não aparecem:**
1. Verifique a conexão com Supabase
2. Confirme que as tabelas foram criadas
3. Verifique as políticas RLS no Supabase

## 📞 **Suporte**

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Confirme que as migrações foram executadas
3. Teste com dados simples primeiro
4. Verifique as permissões no Supabase

---

**🎉 Pronto! Agora você tem acesso completo ao módulo financeiro!**

O sistema foi projetado especificamente para empresas de turismo, então ele entende as particularidades do seu negócio, como vincular custos e receitas a viagens específicas.