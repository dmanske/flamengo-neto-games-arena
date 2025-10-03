# 📱 Guia do Usuário - Templates de WhatsApp

## 🎯 Visão Geral

O sistema de Templates de WhatsApp permite criar, gerenciar e enviar mensagens personalizadas em massa para passageiros de viagens. Com este sistema, você pode:

- ✅ Criar templates reutilizáveis com variáveis dinâmicas
- ✅ Organizar templates por categorias
- ✅ Enviar mensagens em massa para múltiplos passageiros
- ✅ Personalizar mensagens antes do envio
- ✅ Acompanhar o progresso e resultados dos envios

---

## 🚀 Como Começar

### 1. Acessando o Sistema

1. Faça login no sistema
2. No menu lateral, clique em **"WhatsViagem"**
3. Você verá a página principal com todos os templates

### 2. Primeira Visualização

Na página inicial você encontrará:
- **Lista de templates** organizados por categoria
- **Filtros** para buscar templates específicos
- **Botões de ação** para criar, editar e excluir templates
- **Estatísticas** de uso dos templates

---

## 📝 Gerenciando Templates

### Criar Novo Template

1. Clique no botão **"Novo Template"**
2. Preencha os campos obrigatórios:
   - **Nome**: Identificação do template
   - **Categoria**: Tipo de mensagem (confirmação, grupo, lembrete, etc.)
   - **Mensagem**: Conteúdo com variáveis dinâmicas

3. Use **variáveis** para personalizar as mensagens:
   ```
   Olá {NOME}! Sua viagem para {DESTINO} está confirmada para {DATA} às {HORARIO}.
   ```

4. Clique em **"Salvar"**

### Variáveis Disponíveis

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{NOME}` | Nome do passageiro | João Silva |
| `{DESTINO}` | Destino da viagem | Rio de Janeiro |
| `{DATA}` | Data da viagem | 15/12/2024 |
| `{HORARIO}` | Horário de saída | 06:00 |
| `{HORARIO_CHEGADA}` | Horário de chegada sugerido | 05:30 |
| `{LOCAL_SAIDA}` | Local de embarque | Terminal Rodoviário |
| `{ONIBUS}` | Número/nome do ônibus | Ônibus 001 |
| `{LINK_GRUPO}` | Link do grupo WhatsApp | https://chat.whatsapp.com/... |
| `{VALOR}` | Valor da viagem | R$ 150,00 |
| `{TELEFONE}` | Telefone de contato | (11) 99999-9999 |

### Categorias de Templates

- **🎯 Confirmação**: Templates para confirmar viagens e reservas
- **👥 Grupo**: Templates com links e informações de grupos WhatsApp
- **⏰ Lembrete**: Templates de lembrete e avisos importantes
- **💰 Cobrança**: Templates para cobrança de pendências
- **📢 Informativo**: Templates com informações gerais
- **🎉 Promocional**: Templates promocionais e ofertas especiais
- **📋 Outros**: Templates diversos não categorizados

### Editar Template

1. Clique no ícone de **edição** (✏️) ao lado do template
2. Modifique os campos desejados
3. Clique em **"Salvar Alterações"**

### Excluir Template

1. Clique no ícone de **lixeira** (🗑️) ao lado do template
2. Confirme a exclusão na caixa de diálogo
3. O template será movido para backup (pode ser recuperado)

---

## 📤 Enviando Mensagens em Massa

### Acessando o Envio em Massa

1. Vá para **Central WhatsApp** no menu
2. Clique na aba **"Em Massa"**
3. Você verá a interface de envio com templates

### Processo de Envio

#### Passo 1: Selecionar Passageiros
- Marque os passageiros que receberão as mensagens
- Use **"Selecionar todos"** para marcar todos de uma vez
- Veja informações como nome, telefone e status de pagamento

#### Passo 2: Escolher Templates
- Na aba **"Templates"**, selecione os templates desejados
- Você pode selecionar **múltiplos templates**
- Cada template será enviado para cada passageiro selecionado

#### Passo 3: Personalizar Mensagens (Opcional)
- Clique no ícone de **edição** em um template selecionado
- Modifique a mensagem conforme necessário
- Use **"Resetar"** para voltar ao template original

#### Passo 4: Visualizar Preview
- Na aba **"Preview"**, veja como as mensagens ficarão
- As variáveis serão substituídas pelos dados reais
- Verifique se tudo está correto antes de enviar

#### Passo 5: Enviar
- Clique em **"Enviar X Mensagens"**
- Acompanhe o progresso em tempo real
- Veja estatísticas de sucessos e falhas

### Mensagem Manual

Alternativamente, você pode enviar uma mensagem personalizada:

1. Vá para a aba **"Manual"**
2. Digite sua mensagem (pode usar variáveis)
3. Selecione os passageiros
4. Clique em **"Enviar"**

---

## 🔍 Recursos Avançados

### Filtros e Busca

- **Busca por texto**: Digite palavras-chave para encontrar templates
- **Filtro por categoria**: Selecione uma categoria específica
- **Visualização por categoria**: Organize templates agrupados

### Preview de Templates

- Clique no ícone de **olho** (👁️) para ver o preview
- Veja como a mensagem ficará com dados reais
- Verifique variáveis substituídas e formatação

### Backup e Recuperação

- Templates excluídos são automaticamente salvos em backup
- Acesse **"Configurações"** → **"Backup"** para recuperar templates
- Exporte todos os templates para arquivo JSON
- Importe templates de arquivos externos

---

## 📊 Monitoramento e Relatórios

### Acompanhando Envios

Durante o envio, você verá:
- **Progresso em tempo real** com barra de progresso
- **Mensagem atual** sendo processada
- **Contadores** de sucessos e falhas
- **Opção de cancelar** o envio a qualquer momento

### Resultados do Envio

Após o envio, visualize:
- **Total de mensagens** enviadas
- **Taxa de sucesso** e falhas
- **Detalhes por passageiro** e template
- **Tempo total** de processamento

---

## ⚠️ Boas Práticas

### Criação de Templates

1. **Use nomes descritivos** para facilitar identificação
2. **Organize por categorias** para melhor gestão
3. **Teste variáveis** antes de usar em massa
4. **Mantenha mensagens concisas** (máximo 4096 caracteres)
5. **Use emojis** para tornar mensagens mais atrativas

### Envio de Mensagens

1. **Verifique dados** dos passageiros antes de enviar
2. **Teste com poucos passageiros** primeiro
3. **Evite spam** - respeite limites do WhatsApp
4. **Monitore resultados** e ajuste conforme necessário
5. **Mantenha backup** dos templates importantes

### Exemplos de Templates Eficazes

#### Template de Confirmação
```
🔴⚫ Olá {NOME}! 

Sua viagem para {DESTINO} está confirmada! ✅

📅 Data: {DATA}
🕐 Saída: {HORARIO}
📍 Local: {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
💰 Valor: {VALOR}

Qualquer dúvida, estamos aqui! 
📞 {TELEFONE}

Vamos juntos torcer pelo Mengão! 🔴⚫⚽
```

#### Template de Lembrete
```
⏰ LEMBRETE IMPORTANTE!

{NOME}, sua viagem para {DESTINO} sai AMANHÃ às {HORARIO}!

📍 Local: {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
⏱️ Chegue às {HORARIO_CHEGADA} (30min antes)

Não esqueça:
✅ Documento com foto
✅ Ingresso do jogo
✅ Máscara (se necessário)

Boa viagem! 🎒✈️
```

#### Template de Grupo
```
👋 Oi {NOME}!

Entre no grupo da viagem {DESTINO}:
{LINK_GRUPO}

📱 Lá você receberá:
✅ Informações importantes
✅ Horários atualizados
✅ Contato direto conosco
✅ Fotos da viagem

Nos vemos no embarque! 🚌🔴⚫
```

---

## 🆘 Solução de Problemas

### Problemas Comuns

**Template não aparece na lista**
- Verifique se está ativo
- Confirme a categoria selecionada
- Limpe os filtros de busca

**Variáveis não são substituídas**
- Verifique a grafia das variáveis
- Confirme se os dados da viagem estão completos
- Use apenas variáveis suportadas

**Erro no envio de mensagens**
- Verifique conexão com internet
- Confirme dados dos passageiros
- Tente enviar para menos passageiros por vez

**Preview não funciona**
- Selecione pelo menos um passageiro
- Verifique se há dados da viagem
- Recarregue a página se necessário

### Contato para Suporte

Se precisar de ajuda adicional:
- 📧 Email: suporte@empresa.com
- 📞 Telefone: (11) 99999-9999
- 💬 WhatsApp: (11) 98888-8888

---

## 🔄 Atualizações e Melhorias

O sistema está em constante evolução. Fique atento às novidades:

- **Novos tipos de variáveis**
- **Integração com outras plataformas**
- **Relatórios mais detalhados**
- **Automação de envios**
- **Templates inteligentes**

---

*Última atualização: Dezembro 2024*
*Versão do sistema: 2.0*