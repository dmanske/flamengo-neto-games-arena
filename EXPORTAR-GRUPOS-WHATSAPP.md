# 📱 Exportar Grupos de Ingressos para WhatsApp

## 🎯 Funcionalidade Implementada

Agora você pode **exportar grupos de ingressos como imagem** para compartilhar com seus clientes no WhatsApp!

## ✨ Características

### O que é exportado:
- ✅ Nome do grupo com cor identificadora
- ✅ Lista completa de passageiros
- ✅ CPF formatado
- ✅ Status do cadastro facial
- ✅ Data de nascimento
- ✅ Telefone de contato
- ✅ Setor do estádio
- ✅ Valor do ingresso
- ✅ Status de pagamento

### O que NÃO é exportado (informações internas):
- ❌ Coluna de Lucro (mantida privada)
- ❌ Botões de ações (Ver, Editar, Deletar)
- ❌ Botões de copiar campos

## 🚀 Como Usar

1. **Acesse** a página de detalhes do jogo
2. **Localize** o grupo que deseja compartilhar
3. **Clique** no botão "Exportar para WhatsApp" no cabeçalho do grupo
4. **Aguarde** a geração da imagem (aparecerá uma notificação)
5. **Imagem será baixada** automaticamente como PNG
6. **Compartilhe** a imagem no WhatsApp com seu cliente

## 📸 Formato da Imagem

- **Largura**: 800px (otimizada para visualização em celular)
- **Qualidade**: Alta resolução (scale 2x)
- **Formato**: PNG com fundo branco
- **Nome do arquivo**: `grupo-[nome-do-grupo].png`

## 🎨 Design da Imagem Exportada

A imagem mantém:
- Cores do grupo para identificação visual
- Layout limpo e profissional
- Tabela organizada e fácil de ler
- Informações essenciais para o cliente
- Badges coloridos para status de pagamento

## 💡 Casos de Uso

### 1. Confirmação de Grupo
Envie para o responsável do grupo confirmar os dados de todos os membros.

### 2. Lista de Presença
Compartilhe com o grupo para que todos vejam quem está confirmado.

### 3. Comprovante
Envie como comprovante da reserva dos ingressos.

### 4. Organização
Facilite a organização de grupos grandes com identificação visual por cor.

## 🔧 Tecnologia Utilizada

- **html2canvas**: Biblioteca para captura de elementos HTML como imagem
- **React Refs**: Para referenciar o elemento a ser exportado
- **Renderização Oculta**: Versão especial do componente renderizada fora da tela

## 📝 Observações

- A imagem é gerada no navegador (client-side)
- Não há envio de dados para servidor externo
- O processo é rápido e seguro
- Funciona em todos os navegadores modernos

## 🎯 Próximas Melhorias Possíveis

- [ ] Adicionar logo da empresa na imagem
- [ ] Opção de incluir/excluir informações específicas
- [ ] Exportar múltiplos grupos de uma vez
- [ ] Compartilhar direto no WhatsApp (via API)
- [ ] Adicionar QR Code para validação
- [ ] Opção de copiar como texto formatado

---

**Implementado em**: Janeiro 2026
**Componente**: `src/components/detalhes-jogo/GrupoIngressos.tsx`
