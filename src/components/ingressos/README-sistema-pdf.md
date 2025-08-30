# Sistema de Impressão PDF - Lista de Clientes (Ingressos)

## 📋 **Visão Geral**

Sistema implementado para exportar lista de clientes do módulo de ingressos em formato PDF, especificamente para enviar ao fornecedor para compra de ingressos.

## 🎯 **Objetivo**

Gerar relatório profissional com lista limpa de clientes contendo apenas as informações essenciais:
- **Número sequencial**
- **Nome do cliente**
- **CPF formatado**
- **Data de nascimento**
- **Setor do estádio**

## 🚀 **Como Usar**

### **1. Acessar a Página de Ingressos**
- Navegue para `/ingressos` no sistema
- Visualize os cards de jogos futuros

### **2. Exportar PDF de um Jogo**
- Localize o card do jogo desejado
- Clique no botão **"PDF"** (ícone de documento)
- O sistema abrirá a janela de impressão do navegador
- Selecione **"Salvar como PDF"** como destino
- Escolha o local para salvar o arquivo

### **3. Resultado**
- Arquivo PDF profissional com layout da empresa
- Lista organizada por número sequencial
- Informações formatadas corretamente
- Pronto para enviar ao fornecedor

## 📊 **Estrutura do Relatório**

### **Cabeçalho**
```
🏢 LOGO DA EMPRESA
📋 LISTA DE CLIENTES - INGRESSOS
🏆 FLAMENGO × ADVERSÁRIO
📅 Data e Horário | 🏟️ Local do Jogo
📊 Total de Ingressos: X
```

### **Tabela Principal**
```
| # | Cliente        | CPF           | Data Nasc. | Setor |
|---|----------------|---------------|------------|-------|
| 1 | João Silva     | 123.456.789-00| 15/03/1985 | Norte |
| 2 | Maria Santos   | 987.654.321-00| 22/07/1990 | Sul   |
| 3 | Pedro Oliveira | 456.789.123-00| 10/12/1988 | Leste |
```

### **Rodapé**
```
🏢 Logo da Empresa + Nome
📅 Data/hora de geração
💻 Sistema de Gestão de Ingressos - Flamengo
```

## 🔧 **Características Técnicas**

### **Componentes Implementados**
- **`IngressosReport.tsx`**: Componente de relatório específico
- **`useIngressosReport.ts`**: Hook para lógica de impressão
- **Integração no `CleanJogoCard.tsx`**: Botão PDF nos cards
- **Atualização na `Ingressos.tsx`**: Lógica de exportação

### **Funcionalidades**
- ✅ **Sem filtros**: Lista completa por padrão
- ✅ **Uma lista por jogo**: Não mistura jogos diferentes
- ✅ **Layout profissional**: Seguindo padrão das viagens
- ✅ **Formatação automática**: CPF e datas formatados
- ✅ **Exportação nativa**: Usando funcionalidade do navegador
- ✅ **Responsivo para impressão**: Quebras de página otimizadas

### **Validações**
- Botão desabilitado se não há ingressos no jogo
- Mensagem de aviso se tentar exportar jogo vazio
- Toast de feedback durante o processo
- Tratamento de erros de impressão

## 📱 **Interface do Usuário**

### **Botão PDF nos Cards**
- **Localização**: Footer do card, entre "Ver" e "Deletar"
- **Ícone**: 📄 FileText (documento)
- **Cor**: Verde quando habilitado, cinza quando desabilitado
- **Tooltip**: "Exportar lista de clientes em PDF"

### **Estados do Botão**
- **Habilitado**: Quando há ingressos no jogo (verde)
- **Desabilitado**: Quando não há ingressos (cinza)
- **Hover**: Efeito visual de destaque

## 🎨 **Layout e Design**

### **Cores e Estilo**
- **Cabeçalho**: Vermelho Flamengo (#DC2626)
- **Tabela**: Cinza claro alternado para legibilidade
- **Logo**: Posicionamento centralizado no topo e rodapé
- **Tipografia**: Fonte limpa e profissional

### **Responsividade**
- **Impressão A4**: Otimizado para papel A4
- **Quebras de página**: Evita cortar linhas da tabela
- **Margens**: 1cm em todas as bordas
- **Densidade**: Máximo aproveitamento do espaço

## 🔄 **Fluxo de Trabalho**

### **Cenário de Uso Típico**
1. **Cliente solicita ingressos** para um jogo específico
2. **Operador cadastra ingressos** no sistema
3. **Operador exporta PDF** com lista de clientes
4. **PDF é enviado ao fornecedor** para compra dos ingressos
5. **Fornecedor compra ingressos** baseado na lista
6. **Ingressos são entregues** conforme a lista

### **Vantagens**
- **Padronização**: Formato único e profissional
- **Eficiência**: Processo rápido e automatizado
- **Precisão**: Dados formatados corretamente
- **Rastreabilidade**: Numeração sequencial para controle

## 🛠️ **Manutenção e Suporte**

### **Arquivos Principais**
```
src/
├── components/ingressos/
│   ├── IngressosReport.tsx      # Componente de relatório
│   └── CleanJogoCard.tsx        # Card com botão PDF
├── hooks/
│   └── useIngressosReport.ts    # Hook de impressão
└── pages/
    └── Ingressos.tsx            # Página principal
```

### **Dependências**
- **react-to-print**: Biblioteca de impressão
- **useEmpresa**: Hook para dados da empresa
- **formatters**: Utilitários de formatação

### **Logs e Debug**
- Console logs para acompanhar processo de exportação
- Toast notifications para feedback do usuário
- Tratamento de erros de impressão

## 📈 **Melhorias Futuras**

### **Possíveis Expansões**
- [ ] Filtros opcionais (por setor, status, etc.)
- [ ] Múltiplos formatos de exportação (Excel, CSV)
- [ ] Personalização do layout por empresa
- [ ] Histórico de relatórios gerados
- [ ] Envio automático por email

### **Otimizações**
- [ ] Cache de dados para melhor performance
- [ ] Compressão de imagens no PDF
- [ ] Pré-visualização antes da impressão
- [ ] Templates personalizáveis

---

## ✅ **Status: Implementado e Funcional**

**Data de Implementação**: 30/08/2025  
**Versão**: 1.0  
**Status**: ✅ Pronto para produção  
**Testado**: ✅ Build e funcionalidade validados