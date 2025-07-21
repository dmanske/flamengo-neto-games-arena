import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, UserPlus, Search, Bell, Menu, Filter, X, Calendar, MapPin, CreditCard, UserCheck, Bus, Loader2, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { useSearch } from "@/hooks/useSearch";

interface DashboardHeaderProps {
  onFiltersChange?: (filters: any) => void;
}

export const DashboardHeader = ({ onFiltersChange }: DashboardHeaderProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { 
    filters, 
    availableAdversarios, 
    availableCidades, 
    updateFilter, 
    resetFilters, 
    getFilterSummary 
  } = useDashboardFilters();
  
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading: isSearchLoading,
    isOpen: isSearchOpen,
    handleResultClick,
    clearSearch
  } = useSearch();

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key as any, value);
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    if (onFiltersChange) {
      onFiltersChange({ dateRange: 'month' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'trip':
        return <Bus className="w-4 h-4 text-purple-600" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'cliente':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'viagem':
        return <Bus className="w-4 h-4 text-purple-600" />;
      case 'onibus':
        return <Bus className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const filterSummary = getFilterSummary();

  return (
    <div className="mb-8">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-xl shadow-sm p-3 border border-gray-100">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 mr-2" 
              onError={(e) => {
                e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png";
              }}
            />
            <span className="font-bold text-xl text-red-600">Caravanas</span>
          </div>
        </div>
        
        {/* Barra de busca removida */}
        
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 text-blue-600" : ""}
          >
            <Filter className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="cursor-pointer p-3 hover:bg-gray-50"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="p-1 rounded-full bg-gray-100 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-red-600 text-white">AD</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600">Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filtros</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Limpar
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Período
                </label>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => handleFilterChange('dateRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="quarter">Último trimestre</SelectItem>
                    <SelectItem value="year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Adversario Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Bus className="w-4 h-4 mr-1" />
                  Adversário
                </label>
                <Select 
                  value={filters.adversario || ""} 
                  onValueChange={(value) => handleFilterChange('adversario', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {availableAdversarios.map((adversario) => (
                      <SelectItem key={adversario} value={adversario}>
                        {adversario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Cidade
                </label>
                <Select 
                  value={filters.cidade || ""} 
                  onValueChange={(value) => handleFilterChange('cidade', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {availableCidades.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Pagamento Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Status Pagamento
                </label>
                <Select 
                  value={filters.statusPagamento || ""} 
                  onValueChange={(value) => handleFilterChange('statusPagamento', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {filterSummary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Filtros ativos:</span>
                  {filterSummary.map((filter, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Dashboard Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Bem-vindo de volta! Aqui está o resumo das suas caravanas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
            <Link to="/dashboard/cadastrar-viagem">
              <Plus className="w-4 h-4 mr-2" />
              Nova Viagem
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-200 shadow-sm">
            <Link to="/dashboard/cadastrar-cliente">
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Cliente
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};