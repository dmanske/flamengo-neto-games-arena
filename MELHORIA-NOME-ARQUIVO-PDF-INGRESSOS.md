# 📄 Melhoria: Nome do Arquivo PDF com Informações do Jogo

## Implementação Realizada

Agora o sistema de PDF de ingressos gera nomes de arquivo **descritivos e organizados** com as informações do jogo.

### 🎯 Funcionalidade

**Antes**: `Lista_Clientes_Ingressos_30-08-2025.pdf`  
**Depois**: `Lista_Clientes_Flamengo_x_Palmeiras_18-09-2025.pdf`

### 📋 Formato do Nome

```
Lista_Clientes_{JOGO}_{DATA}.pdf
```

**Onde:**
- `{JOGO}` = Nome do jogo baseado no local:
  - **Casa**: `Flamengo_x_Adversario`
  - **Fora**: `Adversario_x_Flamengo`
- `{DATA}` = Data do jogo no formato `DD-MM-AAAA`

### 🔧 Exemplos Práticos

| Jogo | Local | Data | Nome do Arquivo |
|------|-------|------|-----------------|
| Flamengo × Palmeiras | Casa | 18/09/2025 | `Lista_Clientes_Flamengo_x_Palmeiras_18-09-2025.pdf` |
| Botafogo × Flamengo | Fora | 25/10/2025 | `Lista_Clientes_Botafogo_x_Flamengo_25-10-2025.pdf` |
| Flamengo × São Paulo | Casa | 15/11/2025 | `Lista_Clientes_Flamengo_x_Sao_Paulo_15-11-2025.pdf` |

### 🛠️ Tratamento de Caracteres Especiais

- **Acentos removidos**: São Paulo → Sao_Paulo
- **Espaços substituídos**: por underscore (_)
- **Caracteres especiais**: removidos ou substituídos
- **Múltiplos underscores**: condensados em um só

### 📁 Arquivos Modificados

1. **`src/hooks/useIngressosReport.ts`**
   - Adicionada interface `JogoInfo`
   - Função `generateFileName()` para criar nome descritivo
   - Lógica de limpeza de caracteres especiais

2. **`src/pages/Ingressos.tsx`**
   - Hook atualizado para receber informações do jogo selecionado
   - Passa dados do `jogoSelecionado` para o hook

### ✅ Benefícios

🎯 **Organização**: Arquivos facilmente identificáveis  
📅 **Data do Jogo**: Não confunde com data de geração  
🏆 **Nome do Jogo**: Identifica imediatamente o confronto  
🏠 **Local**: Diferencia jogos em casa vs fora  
📂 **Compatibilidade**: Nomes seguros para todos os sistemas  

### 🔄 Fallback

Se não houver informações do jogo (caso raro), mantém o formato antigo:
`Lista_Clientes_Ingressos_30-08-2025.pdf`

---

**Status**: ✅ Implementado e testado  
**Data**: 30/08/2025  
**Impacto**: Melhoria significativa na organização de arquivos