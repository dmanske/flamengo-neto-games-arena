
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/viagens" element={<div className="container py-6"><h1 className="text-3xl font-bold">Viagens</h1></div>} />
              <Route path="/passageiros" element={<div className="container py-6"><h1 className="text-3xl font-bold">Passageiros</h1></div>} />
              <Route path="/onibus" element={<div className="container py-6"><h1 className="text-3xl font-bold">Ônibus</h1></div>} />
              <Route path="/embarques" element={<div className="container py-6"><h1 className="text-3xl font-bold">Embarques</h1></div>} />
              <Route path="/pagamentos" element={<div className="container py-6"><h1 className="text-3xl font-bold">Pagamentos</h1></div>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
