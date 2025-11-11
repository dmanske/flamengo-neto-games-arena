# ✅ Checklist de Implementação - Sistema de QR Code

## 📋 ANTES DE COMEÇAR

- [x] Dependências instaladas (`npm install qrcode @zxing/library @types/qrcode`)
- [x] Arquivos criados (serviço, componentes, páginas)
- [x] Rotas adicionadas no App.tsx
- [ ] SQL executado no Supabase
- [ ] Componente integrado em DetalhesViagem

---

## 🗄️ PASSO 1: BANCO DE DADOS

### Executar SQL no Supabase

- [ ] Acessei https://supabase.com
- [ ] Entrei no meu projeto
- [ ] Abri o SQL Editor
- [ ] Cliquei em "New Query"
- [ ] Copiei o arquivo `database/migrations/create-qr-code-system.sql`
- [ ] Colei no editor
- [ ] Cliquei em "Run" (ou Ctrl+Enter)
- [ ] Vi a mensagem de sucesso: ✅ "Sistema de QR Code instalado com sucesso!"

**Status:** ⬜ Não iniciado | ⏳ Em andamento | ✅ Concluído

---

## 💻 PASSO 2: INTEGRAÇÃO NO FRONTEND

### 2.1 Adicionar Imports

Arquivo: `src/pages/DetalhesViagem.tsx`

- [ ] Adicionei: `import { QRCodeSection } from '@/components/qr-code/QRCodeSection';`
- [ ] Adicionei `QrCode` no import do lucide-react

**Linha esperada:**
```typescript
import { Users, DollarSign, UserCheck, UserX, TrendingUp, AlertCircle, QrCode } from "lucide-react";
```

### 2.2 Modificar TabsList

- [ ] Encontrei a linha: `<TabsList className="grid w-full grid-cols-3 mb-6">`
- [ ] Mudei para: `<TabsList className="grid w-full grid-cols-4 mb-6">`

### 2.3 Adicionar Nova Aba

- [ ] Adicionei o TabsTrigger para QR Codes:
```typescript
<TabsTrigger value="qrcodes" className="flex items-center gap-2">
  <QrCode className="h-4 w-4" />
  QR Codes
</TabsTrigger>
```

### 2.4 Adicionar Conteúdo da Aba

- [ ] Adicionei o TabsContent:
```typescript
<TabsContent value="qrcodes" className="space-y-6">
  <QRCodeSection 
    viagemId={id || ''}
    viagem={viagem}
    passageiros={originalPassageiros}
    onUpdatePassageiros={() => fetchPassageiros(id || '')}
  />
</TabsContent>
```

**Status:** ⬜ Não iniciado | ⏳ Em andamento | ✅ Concluído

---

## 🧪 PASSO 3: TESTES

### 3.1 Compilação

- [ ] Executei `npm run dev`
- [ ] Servidor iniciou sem erros
- [ ] Não há erros no console do navegador (F12)

### 3.2 Interface

- [ ] Fiz login no sistema
- [ ] Acessei Dashboard → Viagens
- [ ] Cliquei em uma viagem com passageiros
- [ ] Vi a nova aba "QR Codes"
- [ ] Consegui clicar na aba

### 3.3 Geração de QR Codes

- [ ] Cliquei no botão "Gerar QR Codes"
- [ ] Vi mensagem de sucesso
- [ ] QR codes apareceram na lista
- [ ] Estatísticas atualizaram (Total, Confirmados, Pendentes)

### 3.4 Scanner

- [ ] Cliquei na aba "Scanner"
- [ ] Cliquei em "Ativar Câmera"
- [ ] Permiti acesso à câmera
- [ ] Câmera abriu corretamente
- [ ] Apontei para um QR code
- [ ] Presença foi confirmada automaticamente
- [ ] Vi toast de sucesso com nome do passageiro

### 3.5 Lista de QR Codes

- [ ] Cliquei na aba "QR Codes"
- [ ] Vi lista de todos os QR codes
- [ ] Vi status de cada passageiro (Confirmado/Pendente)
- [ ] Consegui baixar um QR code individual
- [ ] Consegui baixar todos os QR codes

**Status:** ⬜ Não iniciado | ⏳ Em andamento | ✅ Concluído

---

## 📱 PASSO 4: WHATSAPP (OPCIONAL)

### 4.1 Configuração Z-API

- [ ] Tenho conta na Z-API
- [ ] Tenho instância ativa
- [ ] Copiei ID da instância
- [ ] Copiei token
- [ ] Adicionei no arquivo `.env`:
  ```env
  VITE_ZAPI_INSTANCE=minha-instancia
  VITE_ZAPI_TOKEN=meu-token
  ```
- [ ] Reiniciei o servidor (`Ctrl+C` e `npm run dev`)

### 4.2 Teste de Envio

- [ ] Cliquei em "Enviar (X)" na aba Visão Geral
- [ ] Vi mensagem de progresso
- [ ] Vi mensagem de sucesso
- [ ] Verifiquei WhatsApp do passageiro
- [ ] Passageiro recebeu mensagem
- [ ] Link no WhatsApp funciona

### 4.3 Página do Cliente

- [ ] Cliquei no link recebido
- [ ] Página abriu corretamente
- [ ] QR code apareceu em tela cheia
- [ ] Informações da viagem estão corretas
- [ ] Informações do passageiro estão corretas
- [ ] Botões "Baixar" e "Compartilhar" funcionam

**Status:** ⬜ Não iniciado | ⏳ Em andamento | ✅ Concluído | ⏭️ Pulado

---

## 🔄 PASSO 5: FLUXO COMPLETO

### Teste End-to-End

- [ ] Admin gerou QR codes
- [ ] Admin enviou via WhatsApp
- [ ] Cliente recebeu link
- [ ] Cliente abriu link
- [ ] Cliente viu QR code
- [ ] Admin abriu scanner
- [ ] Admin escaneou QR code do cliente
- [ ] Presença foi confirmada
- [ ] Status atualizou na lista
- [ ] Estatísticas atualizaram

**Status:** ⬜ Não iniciado | ⏳ Em andamento | ✅ Concluído

---

## 🐛 TROUBLESHOOTING

### Problemas Encontrados

- [ ] Nenhum problema encontrado ✅
- [ ] Problema resolvido: _______________
- [ ] Problema pendente: _______________

### Erros Comuns Verificados

- [ ] ✅ SQL executado corretamente
- [ ] ✅ Imports adicionados
- [ ] ✅ Ícone QrCode importado
- [ ] ✅ Props passadas corretamente
- [ ] ✅ Câmera funciona (HTTPS)
- [ ] ✅ Z-API configurada (se aplicável)

---

## 📊 MÉTRICAS DE SUCESSO

### Funcionalidades Testadas

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Gerar QR Codes | ⬜ | |
| Regenerar QR Codes | ⬜ | |
| Deletar QR Codes | ⬜ | |
| Scanner de Câmera | ⬜ | |
| Confirmar Presença | ⬜ | |
| Enviar WhatsApp (Todos) | ⬜ | |
| Enviar WhatsApp (Individual) | ⬜ | |
| Baixar QR Codes | ⬜ | |
| Página do Cliente | ⬜ | |
| Estatísticas | ⬜ | |

**Legenda:** ⬜ Não testado | ✅ Funcionando | ❌ Com erro | ⏭️ Não aplicável

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Mínimo para Produção

- [ ] SQL executado sem erros
- [ ] Aba QR Codes aparece
- [ ] Gerar QR codes funciona
- [ ] Scanner funciona
- [ ] Presença é confirmada
- [ ] Estatísticas atualizam

### Ideal para Produção

- [ ] Todos os critérios mínimos ✅
- [ ] WhatsApp configurado e funcionando
- [ ] Página do cliente testada
- [ ] Fluxo completo testado
- [ ] Equipe treinada
- [ ] Documentação lida

---

## 📝 NOTAS E OBSERVAÇÕES

### Data de Implementação
- Início: ___/___/___
- Conclusão: ___/___/___

### Responsável
- Nome: _______________
- Contato: _______________

### Observações Importantes
```
(Espaço para anotações)




```

---

## ✅ CONCLUSÃO

### Status Final

- [ ] ✅ Sistema 100% funcional
- [ ] ⚠️ Sistema funcional com ressalvas
- [ ] ❌ Sistema com problemas

### Próximos Passos

- [ ] Treinar equipe
- [ ] Testar com passageiros reais
- [ ] Monitorar uso inicial
- [ ] Coletar feedback
- [ ] Ajustar conforme necessário

---

## 🎉 SISTEMA PRONTO PARA PRODUÇÃO!

**Assinatura:** _______________  
**Data:** ___/___/___

---

**Versão do Checklist:** 1.0.0  
**Última Atualização:** Novembro 2024
