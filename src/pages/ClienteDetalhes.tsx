import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  BarChart3,
  Loader2,
  Ticket,
  Wallet
} from 'lucide-react';
import { useClienteDetalhes } from '@/hooks/useClienteDetalhes';
import { formatPhone, formatCPF, formatarNomeComPreposicoes } from '@/utils/formatters';

// Componentes das seções
import InformacoesPessoais from '@/components/cliente-detalhes/InformacoesPessoais';
import HistoricoViagens from '@/components/cliente-detalhes/HistoricoViagens';
import SituacaoFinanceira from '@/components/cliente-detalhes/SituacaoFinanceira';
import IngressosCliente from '@/components/cliente-detalhes/IngressosCliente';
import CreditosCliente from '@/components/cliente-detalhes/CreditosCliente';

import EstatisticasInsights from '@/components/cliente-detalhes/EstatisticasInsights';
import AcoesRapidas from '@/components/cliente-detalhes/AcoesRapidas';

type TabType = 'pessoal' | 'viagens' | 'financeiro' | 'insights' | 'ingressos' | 'creditos';

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  
  const { cliente, loading, error } = useClienteDetalhes(id || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando perfil do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente não encontrado</h2>
          <p className="text-gray-600 mb-6">
            {error || 'O cliente que você está procurando não existe ou foi removido.'}
          </p>
          <Button onClick={() => navigate('/dashboard/clientes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'pessoal', label: 'Pessoal', icon: User },
    { id: 'viagens', label: 'Viagens', icon: Calendar },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'ingressos', label: 'Ingressos', icon: Ticket },
    { id: 'creditos', label: 'Créditos', icon: Wallet },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pessoal':
        return <InformacoesPessoais cliente={cliente.cliente} />;
      case 'viagens':
        return <HistoricoViagens clienteId={id || ''} />;
      case 'financeiro':
        return <SituacaoFinanceira clienteId={id || ''} cliente={cliente.cliente} />;
      case 'ingressos':
        return <IngressosCliente clienteId={id || ''} cliente={cliente.cliente} />;
      case 'creditos':
        return <CreditosCliente clienteId={id || ''} cliente={cliente.cliente} />;
      case 'insights':
        return <EstatisticasInsights clienteId={id || ''} />;
      default:
        return <InformacoesPessoais cliente={cliente.cliente} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Breadcrumb e ações */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/clientes')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="text-sm text-gray-500">
                <Link to="/dashboard/clientes" className="hover:text-gray-700">
                  Clientes
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Perfil do Cliente</span>
              </div>
            </div>
            
            <Button 
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Link to={`/dashboard/clientes/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>

          {/* Informações do cliente */}
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                {cliente.cliente.foto ? (
                  <AvatarImage 
                    src={cliente.cliente.foto} 
                    alt={cliente.cliente.nome}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl">
                    {cliente.cliente.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Indicador online (fake para demo) */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            {/* Dados principais */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {formatarNomeComPreposicoes(cliente.cliente.nome)}
                </h1>
                {cliente.badges.includes('VIP') && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                    👑 VIP
                  </Badge>
                )}
                {cliente.badges.includes('Fiel') && (
                  <Badge variant="secondary">🎯 Fiel</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {cliente.cliente.telefone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{formatPhone(cliente.cliente.telefone)}</span>
                  </div>
                )}
                
                {cliente.cliente.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{cliente.cliente.email}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{cliente.cliente.cidade}, {cliente.cliente.estado}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-purple-600" />
                  <span>Cliente desde {new Date(cliente.cliente.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conteúdo da tab ativa */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
          
          {/* Sidebar com ações rápidas */}
          <div className="lg:col-span-1">
            <AcoesRapidas cliente={cliente.cliente} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetalhes;