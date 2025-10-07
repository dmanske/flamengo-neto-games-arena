# Plano de Implementação - Integração Landing Page e Sistema Admin

- [x] 1. Preparar estrutura de arquivos para landing page
  - Criar diretório `src/components/landing/` para componentes da landing page
  - Criar diretório `src/assets/landing/` para assets da landing page
  - Criar diretório `src/hooks/landing/` para hooks específicos da landing page
  - _Requirements: 1.1, 3.1_

- [ ] 2. Migrar assets da landing page
  - [x] 2.1 Copiar todas as imagens da pasta `land/landpageatualneto/src/assets/` para `src/assets/landing/`
    - Copiar logos, imagens de hero, galeria, ônibus e avatares
    - Organizar assets por categoria (logos, gallery, testimonials, etc.)
    - _Requirements: 1.2_

  - [x] 2.2 Verificar e otimizar assets copiados
    - Verificar se todas as imagens foram copiadas corretamente
    - Confirmar que os caminhos dos assets estão funcionando
    - _Requirements: 1.4_

- [ ] 3. Migrar componentes da landing page
  - [x] 3.1 Copiar componentes principais da landing page
    - Copiar Hero, Navbar, About, Contact, Footer da pasta `land/landpageatualneto/src/components/`
    - Adaptar imports dos assets para nova estrutura de pastas
    - _Requirements: 1.2, 3.2_

  - [x] 3.2 Copiar componentes secundários da landing page
    - Copiar GalleryGrid, BusShowcase, Testimonials, Tours, UpcomingTrips
    - Copiar TicketInfo, InstagramSection, FloatingWhatsApp, VideoTestimonial
    - Adaptar todos os imports e dependências
    - _Requirements: 1.2, 3.2_

  - [ ] 3.3 Migrar componentes UI específicos da landing page
    - Copiar componentes da pasta `land/landpageatualneto/src/components/ui/` que não existem no projeto atual
    - Verificar conflitos com componentes UI existentes
    - _Requirements: 3.2_

- [ ] 4. Configurar roteamento para landing page
  - [x] 4.1 Criar página principal da landing page
    - Criar `src/pages/LandingPage.tsx` importando todos os componentes migrados
    - Estruturar a página seguindo a ordem: Navbar, Hero, About, Gallery, etc.
    - _Requirements: 1.1, 3.1_

  - [x] 4.2 Configurar rota principal para landing page
    - Modificar roteamento principal para exibir LandingPage na rota `/`
    - Garantir que rota `/admin` continue funcionando normalmente
    - Testar que não há conflitos entre as rotas
    - _Requirements: 1.1, 4.1, 4.3_

- [ ] 5. Migrar hooks e utilitários da landing page
  - [x] 5.1 Copiar hooks específicos da landing page
    - Copiar `use-mobile.tsx` e `use-toast.ts` da pasta `land/landpageatualneto/src/hooks/`
    - Verificar se já existem hooks similares no projeto atual
    - _Requirements: 3.2_

  - [ ] 5.2 Migrar utilitários e configurações
    - Copiar `src/lib/utils.ts` se houver diferenças com o atual
    - Verificar configurações específicas da landing page
    - _Requirements: 3.2_

- [ ] 6. Configurar dependências da landing page
  - [x] 6.1 Instalar dependências específicas da landing page
    - Instalar framer-motion, embla-carousel-react, react-intersection-observer
    - Instalar outras dependências que não existem no projeto atual
    - _Requirements: 3.2_

  - [ ] 6.2 Verificar compatibilidade de dependências
    - Verificar se versões das dependências são compatíveis
    - Resolver conflitos de versão se houver
    - _Requirements: 3.2_

- [ ] 7. Adaptar estilos e temas da landing page
  - [x] 7.1 Migrar estilos CSS específicos
    - Copiar estilos do `land/landpageatualneto/src/index.css` que não existem no projeto atual
    - Adaptar variáveis CSS e temas específicos da landing page
    - _Requirements: 1.2_

  - [ ] 7.2 Configurar Tailwind para landing page
    - Verificar se configuração do Tailwind suporta classes usadas na landing page
    - Adicionar configurações específicas se necessário
    - _Requirements: 1.2_

- [ ] 8. Testar integração da landing page
  - [x] 8.1 Testar carregamento da landing page
    - Verificar se landing page carrega corretamente na rota `/`
    - Testar se todos os componentes são renderizados
    - Verificar se assets são carregados corretamente
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 8.2 Testar funcionalidades da landing page
    - Testar links de contato (WhatsApp, email)
    - Testar navegação entre seções da página
    - Testar responsividade em diferentes dispositivos
    - _Requirements: 1.3_

- [ ] 9. Verificar isolamento do sistema admin
  - [x] 9.1 Testar acesso ao sistema admin
    - Verificar se rota `/admin` continua funcionando normalmente
    - Testar login e navegação no sistema admin
    - Confirmar que não há interferência da landing page
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 9.2 Verificar separação de componentes
    - Confirmar que componentes da landing page não afetam o admin
    - Verificar que estilos da landing page não interferem no admin
    - Testar que assets são carregados independentemente
    - _Requirements: 3.1, 3.2, 4.3_

- [ ] 10. Otimizar performance da integração
  - [ ] 10.1 Implementar lazy loading para componentes
    - Configurar carregamento sob demanda para landing page e admin
    - Otimizar bundle splitting entre landing page e admin
    - _Requirements: 3.1_

  - [ ] 10.2 Otimizar carregamento de assets
    - Implementar lazy loading para imagens da landing page
    - Otimizar tamanho e formato das imagens
    - _Requirements: 1.4_

- [ ] 11. Configurar variáveis de ambiente
  - [ ] 11.1 Configurar dados de contato
    - Definir variáveis para número do WhatsApp, email, Instagram
    - Configurar mensagens padrão para contato
    - _Requirements: 1.3_

  - [ ] 11.2 Configurar dados dinâmicos da landing page
    - Configurar informações de viagens que aparecem na landing page
    - Definir dados que podem ser atualizados facilmente
    - _Requirements: 1.2_

- [ ] 12. Testes finais e validação
  - [x] 12.1 Teste completo de navegação
    - Testar fluxo completo: landing page → contato → WhatsApp
    - Testar fluxo admin: `/admin` → login → dashboard
    - Verificar que não há vazamentos entre os sistemas
    - _Requirements: 1.1, 1.3, 4.1, 4.4_

  - [ ] 12.2 Teste de responsividade e compatibilidade
    - Testar landing page em diferentes dispositivos e navegadores
    - Verificar que sistema admin continua funcionando em todos os dispositivos
    - _Requirements: 1.2, 4.2_