import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard,
  Info,
  ExternalLink
} from 'lucide-react';
import { formatPhone, formatCPF } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  data_nascimento: string | null;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
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
    let nascimento;
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
                        let data;
                        
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">CEP</label>
                <p className="text-gray-900 font-mono">
                  {cliente.endereco.cep || 'Não informado'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Endereço</label>
                <p className="text-gray-900">
                  {cliente.endereco.rua || 'Não informado'}
                  {cliente.endereco.numero && `, ${cliente.endereco.numero}`}
                  {cliente.endereco.complemento && `, ${cliente.endereco.complemento}`}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Bairro</label>
                <p className="text-gray-900">{cliente.endereco.bairro || 'Não informado'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Cidade / Estado</label>
                <p className="text-gray-900">
                  {cliente.endereco.cidade || 'Não informado'} - {cliente.endereco.estado || 'Não informado'}
                </p>
              </div>
            </div>
          </div>
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