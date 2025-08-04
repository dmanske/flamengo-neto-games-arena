import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Info,
  ExternalLink
} from 'lucide-react';
import { formatPhone, formatCPF } from '@/utils/formatters';
import { formatCEP, formatAddressLines, capitalizeWords } from '@/utils/cepUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  data_nascimento: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  como_conheceu: string;
  observacoes?: string;
  created_at: string;
}

interface InformacoesPessoaisProps {
  cliente: Cliente;
}

const InformacoesPessoais: React.FC<InformacoesPessoaisProps> = ({ cliente }) => {
  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    
    // Garantir que a data seja interpretada corretamente
    let nascimento: Date;
    if (dataNascimento.includes('-') && !dataNascimento.includes('T')) {
      nascimento = new Date(dataNascimento + 'T00:00:00');
    } else {
      nascimento = new Date(dataNascimento);
    }
    
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const abrirWhatsApp = () => {
    const telefone = cliente.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}`;
    window.open(url, '_blank');
  };

  const abrirEmail = () => {
    const url = `mailto:${cliente.email}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Dados Pessoais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-lg font-semibold text-gray-900">{cliente.nome}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-gray-900 font-mono">
                  {cliente.cpf ? formatCPF(cliente.cpf) : 'Não informado'}
                </p>
              </div>
              
              {cliente.data_nascimento && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {(() => {
                        // Garantir que a data seja interpretada corretamente
                        const dataString = cliente.data_nascimento;
                        let data: Date;
                        
                        // Se a data está no formato YYYY-MM-DD, adicionar horário para evitar problemas de timezone
                        if (dataString.includes('-') && !dataString.includes('T')) {
                          data = new Date(dataString + 'T00:00:00');
                        } else {
                          data = new Date(dataString);
                        }
                        
                        return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                      })()}
                      <span className="text-gray-500 ml-2">
                        ({calcularIdade(cliente.data_nascimento)} anos)
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <p className="text-gray-900">{formatPhone(cliente.telefone)}</p>
                  {cliente.telefone && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={abrirWhatsApp}
                      className="ml-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-gray-900">{cliente.email || 'Não informado'}</p>
                  {cliente.email && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={abrirEmail}
                      className="ml-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <span>Endereço</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Criar objeto de endereço compatível com as funções de formatação
            const enderecoObj = {
              cep: cliente.cep,
              rua: cliente.endereco,
              numero: cliente.numero,
              complemento: cliente.complemento,
              bairro: cliente.bairro,
              cidade: cliente.cidade,
              estado: cliente.estado
            };
            
            const addressLines = formatAddressLines(enderecoObj);
            const hasAddress = addressLines.length > 0;
            
            if (!hasAddress) {
              return (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Endereço não informado</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-6">
                {/* Detalhes Separados */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cliente.cep && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CEP</label>
                      <p className="text-sm font-mono text-gray-900 mt-1">
                        {formatCEP(cliente.cep)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.endereco && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Logradouro</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {capitalizeWords(cliente.endereco)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.numero && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Número</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {cliente.numero}
                      </p>
                    </div>
                  )}
                  
                  {cliente.complemento && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Complemento</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {capitalizeWords(cliente.complemento)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.bairro && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bairro</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {capitalizeWords(cliente.bairro)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.cidade && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cidade</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {capitalizeWords(cliente.cidade)}
                      </p>
                    </div>
                  )}
                  
                  {cliente.estado && (
                    <div className="bg-white border rounded-lg p-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {cliente.estado.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Botão Google Maps */}
                {hasAddress && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const enderecoCompleto = addressLines.slice(0, -1).join(', '); // Remove CEP
                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
                        window.open(url, '_blank');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver no Google Maps
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Outras Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-purple-600" />
            <span>Outras Informações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Como conheceu a empresa</label>
              <p className="text-gray-900">{cliente.como_conheceu}</p>
            </div>
            
            {cliente.observacoes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observações</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {cliente.observacoes}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Cadastrado em</label>
              <p className="text-gray-900">
                {format(new Date(cliente.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InformacoesPessoais;