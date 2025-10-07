# Design Técnico - Integração Landing Page e Sistema Admin

## Visão Geral

Este documento define a arquitetura técnica para integrar a nova landing page como página inicial pública, mantendo o sistema administrativo completamente separado e protegido.

## Arquitetura

### Estrutura de Rotas

```
/                    → Landing Page (público)
/admin              → Sistema Admin (protegido)
/admin/*            → Todas as rotas admin atuais
```

### Separação de Responsabilidades

```
┌─────────────────────────────────────────┐
│                PROJETO                  │
├─────────────────────────────────────────┤
│  LANDING PAGE        │   SISTEMA ADMIN  │
│  ─────────────       │   ─────────────  │
│  • Rota: /           │   • Rota: /admin │
│  • Componentes novos │   • Componentes  │
│  • Assets próprios  │     atuais       │
│  • Público           │   • Protegido    │
└─────────────────────────────────────────┘
```

## Componentes e Interfaces

### 1. Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                    # shadcn/ui (compartilhado)
│   ├── landing/               # Componentes da landing page
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Contact.tsx
│   │   ├── Tours.tsx
│   │   ├── Testimonials.tsx
│   │   ├── BusShowcase.tsx
│   │   ├── GalleryGrid.tsx
│   │   ├── UpcomingTrips.tsx
│   │   ├── TicketInfo.tsx
│   │   ├── InstagramSection.tsx
│   │   ├── FloatingWhatsApp.tsx
│   │   └── VideoTestimonial.tsx
│   └── admin/                 # Componentes admin (atuais)
│       └── ... (mantidos)
├── pages/
│   ├── LandingPage.tsx        # Nova página inicial
│   ├── AdminLogin.tsx         # Login admin (atual)
│   └── ... (páginas admin atuais)
├── assets/
│   ├── landing/               # Assets da landing page
│   │   ├── hero-maracana.jpg
│   │   ├── flamengo-logo-oficial.png
│   │   ├── neto-tours-logo.png
│   │   └── ... (outros assets)
│   └── admin/                 # Assets admin (atuais)
└── hooks/
    ├── landing/               # Hooks da landing page
    └── admin/                 # Hooks admin (atuais)
```

### 2. Roteamento

```typescript
// App.tsx ou router principal
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminApp /></ProtectedRoute>,
    children: [
      // Todas as rotas admin atuais
    ]
  }
]);
```

### 3. Componente Landing Page

```typescript
// src/pages/LandingPage.tsx
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
// ... outros imports

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <GalleryGrid />
      <BusShowcase />
      <Testimonials />
      <TicketInfo />
      <UpcomingTrips />
      <Tours />
      <InstagramSection />
      <Contact />
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};
```

## Modelos de Dados

### Assets da Landing Page

```typescript
interface LandingAssets {
  heroImage: string;
  flamengoLogo: string;
  netoToursLogo: string;
  galleryImages: string[];
  busImages: string[];
  testimonialAvatars: string[];
  opponentLogos: {
    palmeiras: string;
    racing: string;
    sport: string;
    bragantino: string;
  };
}
```

### Configuração de Contato

```typescript
interface ContactConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  instagram: string;
  address: string;
}
```

### Dados de Viagens (para exibição pública)

```typescript
interface PublicTrip {
  id: string;
  opponent: string;
  opponentLogo: string;
  date: string;
  stadium: string;
  price?: string;
  available: boolean;
}
```

## Tratamento de Erros

### 1. Fallbacks para Assets

```typescript
// Hook para carregar assets com fallback
const useAssetWithFallback = (assetPath: string, fallback: string) => {
  const [src, setSrc] = useState(assetPath);
  
  const handleError = () => {
    setSrc(fallback);
  };
  
  return { src, onError: handleError };
};
```

### 2. Tratamento de Rotas

```typescript
// Componente para rotas não encontradas
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1>Página não encontrada</h1>
        <Link to="/">Voltar ao início</Link>
      </div>
    </div>
  );
};
```

## Estratégia de Testes

### 1. Testes de Componentes da Landing Page

```typescript
// Testes para componentes críticos
describe('Landing Page Components', () => {
  test('Hero component renders correctly', () => {
    render(<Hero />);
    expect(screen.getByText(/Viva a Paixão pelo Flamengo/i)).toBeInTheDocument();
  });
  
  test('Contact links work properly', () => {
    render(<Contact />);
    const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });
});
```

### 2. Testes de Roteamento

```typescript
describe('Routing', () => {
  test('/ renders landing page', () => {
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });
  
  test('/admin redirects to login when not authenticated', () => {
    render(<App />);
    // Teste de redirecionamento
  });
});
```

## Considerações de Performance

### 1. Lazy Loading de Assets

```typescript
// Carregamento otimizado de imagens
const LazyImage = ({ src, alt, className }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};
```

### 2. Code Splitting

```typescript
// Separação de código entre landing e admin
const AdminApp = lazy(() => import('./AdminApp'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
```

### 3. Otimização de Bundle

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'landing': ['./src/pages/LandingPage.tsx'],
          'admin': ['./src/pages/AdminApp.tsx'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  }
});
```

## Migração e Deploy

### 1. Estratégia de Migração

```bash
# Passo 1: Copiar assets da landing page
cp -r land/landpageatualneto/src/assets/* src/assets/landing/

# Passo 2: Copiar componentes
cp -r land/landpageatualneto/src/components/* src/components/landing/

# Passo 3: Adaptar imports e dependências
# Passo 4: Configurar roteamento
# Passo 5: Testar integração
```

### 2. Configuração de Build

```json
// package.json
{
  "scripts": {
    "build:landing": "vite build --mode landing",
    "build:admin": "vite build --mode admin",
    "build": "vite build"
  }
}
```

### 3. Variáveis de Ambiente

```env
# .env
VITE_WHATSAPP_NUMBER=5521999999999
VITE_CONTACT_EMAIL=contato@netotours.com
VITE_INSTAGRAM_URL=https://instagram.com/netotours
```

## Segurança

### 1. Proteção de Rotas Admin

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};
```

### 2. Sanitização de Dados Públicos

```typescript
// Apenas dados seguros são expostos na landing page
const getPublicTripData = (trip: Trip): PublicTrip => {
  return {
    id: trip.id,
    opponent: trip.opponent,
    date: trip.date,
    stadium: trip.stadium,
    available: trip.available
    // Dados sensíveis não são expostos
  };
};
```

## Monitoramento

### 1. Analytics da Landing Page

```typescript
// Tracking de eventos importantes
const trackContactClick = () => {
  gtag('event', 'contact_click', {
    event_category: 'engagement',
    event_label: 'whatsapp'
  });
};
```

### 2. Logs de Erro

```typescript
// Error boundary para capturar erros
class LandingErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Landing page error:', error, errorInfo);
    // Enviar para serviço de monitoramento
  }
}
```