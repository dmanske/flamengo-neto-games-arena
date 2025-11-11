# ✅ Checklist de Implementação

Use este checklist para garantir que todos os passos foram executados corretamente.

## 📋 Pré-Instalação

- [ ] Node.js 18+ instalado
- [ ] React 18+ no projeto
- [ ] TypeScript configurado
- [ ] Supabase configurado e conectado
- [ ] WhatsApp API configurada (Z-API ou Evolution)

## 🔧 Instalação

### Passo 1: Dependências
- [ ] Executado: `npm install qrcode @zxing/library`
- [ ] Executado: `npm install --save-dev @types/qrcode`
- [ ] Verificado: `npm list qrcode @zxing/library` (sem erros)

### Passo 2: Banco de Dados
- [ ] Aberto Supabase Dashboard
- [ ] Acessado SQL Editor
- [ ] Executado: `create-qr-code-system-final-working.sql` ✅
- [ ] Executado: `fix_qr_code_updated_at.sql` ✅
- [ ] Executado: `update_qr_function_hora_embarque.sql` ✅
- [ ] Executado: `add_qrcode_template.sql` ✅
- [ ] Verificado: Tabelas criadas (passageiro_qr_tokens, passageiro_confirmacoes)
- [ ] Verificado: Funções criadas (generate_qr_tokens_for_viagem, validate_and_use_qr_token)

### Passo 3: Arquivos
- [ ] Copiado: `src/services/qrCodeService.ts`
- [ ] Copiado: `src/components/qr-code/QRCodeSection.tsx`
- [ ] Copiado: `src/components/qr-scanner/QRScanner.tsx`
- [ ] Copiado: `src/components/qr-scanner/QRScannerSimple.tsx`
- [ ] Copiado: `src/components/configuracao/ConfiguracaoMensagemQRCode.tsx`
- [ ] Copiado: `src/pages/MeuQRCode.tsx`
- [ ] Copiado: `src/pages/ScannerPresenca.tsx`
- [ ] Copiado: `src/pages/ScannerPresencaPublico.tsx`

### Passo 4: Rotas
- [ ] Adicionado rota: `/meu-qrcode/:token`
- [ ] Adicionado rota: `/dashboard/scanner/:viagemId`
- [ ] Adicionado rota: `/dashboard/scanner/:viagemId/onibus/:onibusId`
- [ ] Adicionado rota: `/scanner-publico/:viagemId`
- [ ] Testado: Rotas acessíveis sem erro 404

### Passo 5: Integração
- [ ] Importado `QRCodeSection` no componente de detalhes
- [ ] Adicionado `<QRCodeSection viagemId={viagemId} />`
- [ ] Verificado: Componente renderiza sem erros
- [ ] Verificado: Botões aparecem na interface

## 🧪 Testes

### Teste 1: Geração de QR Codes
- [ ] Aberto uma viagem no dashboard
- [ ] Clicado em "Gerar QR Codes"
- [ ] Aguardado conclusão (sem erros no console)
- [ ] Verificado: QR codes gerados com sucesso
- [ ] Verificado: Mensagem de sucesso exibida

### Teste 2: Visualização do QR Code (Cliente)
- [ ] Copiado um token gerado
- [ ] Acessado: `/meu-qrcode/{token}`
- [ ] Verificado: QR code aparece na tela
- [ ] Verificado: Informações da viagem aparecem
- [ ] Verificado: Dados do passageiro aparecem

### Teste 3: Scanner de Câmera
- [ ] Clicado em "Abrir Scanner"
- [ ] Permitido acesso à câmera
- [ ] Verificado: Câmera ativa e funcionando
- [ ] Apontado para um QR code gerado
- [ ] Verificado: QR code detectado automaticamente
- [ ] Verificado: Presença confirmada com sucesso

### Teste 4: Validação de Token
- [ ] Escaneado QR code válido
- [ ] Verificado: Confirmação bem-sucedida
- [ ] Tentado escanear o mesmo QR code novamente
- [ ] Verificado: Erro "QR Code já utilizado"
- [ ] Verificado: Mensagem de erro clara

### Teste 5: Estatísticas
- [ ] Verificado: Contador de QR codes gerados
- [ ] Verificado: Contador de confirmações por QR
- [ ] Verificado: Contador de confirmações manuais
- [ ] Verificado: Percentual de confirmações
- [ ] Verificado: Atualização em tempo real

### Teste 6: WhatsApp (Opcional)
- [ ] Clicado em "Enviar WhatsApp"
- [ ] Selecionado passageiros
- [ ] Verificado: Mensagens enviadas
- [ ] Verificado: Links funcionando
- [ ] Verificado: QR codes abrindo corretamente

## 🔐 Segurança

- [ ] Verificado: RLS habilitado nas tabelas
- [ ] Verificado: Políticas de acesso funcionando
- [ ] Testado: Usuário não autorizado não acessa
- [ ] Verificado: Tokens únicos e seguros
- [ ] Verificado: Expiração de tokens funcionando

## 📱 Compatibilidade

### Desktop
- [ ] Testado: Chrome
- [ ] Testado: Firefox
- [ ] Testado: Safari
- [ ] Testado: Edge

### Mobile
- [ ] Testado: Chrome Mobile (Android)
- [ ] Testado: Safari Mobile (iOS)
- [ ] Testado: Firefox Mobile
- [ ] Verificado: Interface responsiva

### Câmera
- [ ] Testado: Câmera frontal
- [ ] Testado: Câmera traseira
- [ ] Testado: Diferentes resoluções
- [ ] Testado: Diferentes iluminações

## 🐛 Troubleshooting

### Se algo não funcionar:

#### Erro: "Module not found"
- [ ] Executado: `npm install`
- [ ] Verificado: package.json tem as dependências
- [ ] Reiniciado: servidor de desenvolvimento

#### Erro: "Function does not exist"
- [ ] Re-executado: SQL principal
- [ ] Verificado: Supabase Dashboard → Database → Functions
- [ ] Verificado: Logs do Supabase

#### Câmera não funciona
- [ ] Verificado: HTTPS habilitado
- [ ] Verificado: Permissões do navegador
- [ ] Testado: Outro navegador
- [ ] Verificado: Console do navegador (erros)

#### QR Code não escaneia
- [ ] Verificado: Boa iluminação
- [ ] Verificado: Tela do cliente com brilho alto
- [ ] Verificado: Distância adequada (10-30cm)
- [ ] Testado: Outro dispositivo

## 📊 Métricas de Sucesso

Após implementação completa, você deve ter:

- [ ] ✅ 100% dos passageiros com QR codes gerados
- [ ] ✅ Scanner funcionando em todos os dispositivos
- [ ] ✅ Confirmações em tempo real
- [ ] ✅ Estatísticas precisas
- [ ] ✅ Zero erros no console
- [ ] ✅ Interface responsiva e rápida
- [ ] ✅ Feedback claro para usuários

## 🎉 Finalização

- [ ] Documentação lida e compreendida
- [ ] Todos os testes passando
- [ ] Equipe treinada no uso
- [ ] Backup do banco de dados realizado
- [ ] Sistema em produção
- [ ] Monitoramento ativo

## 📞 Suporte

Se precisar de ajuda:

1. Consulte: `README.md`
2. Consulte: `ESTRUTURA.md`
3. Consulte: `docs/SISTEMA_QR_CODE_INSTRUCOES.md`
4. Verifique: Console do navegador
5. Verifique: Logs do Supabase

## ⏱️ Tempo Estimado

- **Instalação**: 15-30 minutos
- **Testes básicos**: 10-15 minutos
- **Testes completos**: 30-45 minutos
- **Total**: 1-2 horas

---

**Marque todos os itens antes de considerar a implementação completa!**

✅ = Concluído
⚠️ = Atenção necessária
❌ = Não concluído
