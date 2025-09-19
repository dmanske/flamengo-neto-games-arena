import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Bus, Phone, Ticket, Users, Instagram } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatPhone, formatCPF } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Removido useViagemDetails para evitar redirecionamentos
import { supabase } from '@/lib/supabase';
import { CreditoBadge, useCreditoBadgeType } from '@/components/detalhes-viagem/CreditoBadge';
import { WifiInfo } from '@/components/onibus/WifiInfo';

// Estilos CSS personalizados para animações
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  }
`;

// Adicionar estilos ao head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  if (!document.head.querySelector('style[data-meu-onibus]')) {
    styleElement.setAttribute('data-meu-onibus', 'true');
    document.head.appendChild(styleElement);
  }
}

// Usando tipos do hook existente - dados sempre consistentes

const MeuOnibus = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [busImages, setBusImages] = useState<Record<string, string>>({});
  const [onibusWifiInfo, setOnibusWifiInfo] = useState<Record<string, any>>({});

  const [authLoading, setAuthLoading] = useState(true);

  // Estados para dados da viagem (versão pública sem redirecionamentos)
  const [viagem, setViagem] = useState<any>(null);
  const [todosPassageiros, setTodosPassageiros] = useState<any[]>([]);
  const [onibusList, setOnibusList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Autenticação automática com usuário padrão
  useEffect(() => {
    const loginAutomatico = async () => {
      try {
        console.log('🔐 Verificando autenticação...');

        // Verificar se já está autenticado
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('✅ Já autenticado');
          setAuthLoading(false);
          return;
        }

        console.log('🔑 Fazendo login automático com usuário padrão...');

        // Credenciais do usuário padrão para clientes
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'meulugar@netoviagens.com',
          password: 'meulugar'
        });

        if (error) {
          console.error('❌ Erro no login automático:', error);
        } else {
          console.log('✅ Login automático realizado com sucesso');
        }

      } catch (error) {
        console.error('❌ Erro na autenticação automática:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loginAutomatico();
  }, []);

  // Buscar dados da viagem após autenticação
  useEffect(() => {
    const fetchDadosViagem = async () => {
      if (authLoading || !id) return;

      // Verificar se o ID é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.warn("ID da viagem não é um UUID válido:", id);
        return;
      }

      try {
        setIsLoading(true);

        // Buscar dados da viagem
        const { data: viagemData, error: viagemError } = await supabase
          .from('viagens')
          .select('*')
          .eq('id', id)
          .single();

        if (viagemError) throw viagemError;
        setViagem(viagemData);

        // Buscar ônibus da viagem
        const { data: onibusData, error: onibusError } = await supabase
          .from("viagem_onibus")
          .select("*")
          .eq("viagem_id", id);

        if (onibusError) throw onibusError;
        setOnibusList(onibusData || []);

        // Buscar informações de WiFi dos ônibus usando tipo_onibus e empresa
        if (onibusData && onibusData.length > 0) {
          const wifiMap: Record<string, any> = {};
          
          // Para cada ônibus da viagem, buscar WiFi pelo tipo_onibus e empresa
          for (const viagemOnibus of onibusData) {
            if (viagemOnibus.tipo_onibus && viagemOnibus.empresa) {
              const { data: onibusWifi, error: wifiError } = await supabase
                .from("onibus")
                .select("id, wifi_ssid, wifi_password")
                .eq("tipo_onibus", viagemOnibus.tipo_onibus)
                .eq("empresa", viagemOnibus.empresa)
                .single();

              if (!wifiError && onibusWifi && (onibusWifi.wifi_ssid || onibusWifi.wifi_password)) {
                // Usar o ID da viagem_onibus como chave
                wifiMap[viagemOnibus.id] = {
                  wifi_ssid: onibusWifi.wifi_ssid,
                  wifi_password: onibusWifi.wifi_password
                };
              }
            }
          }
          
          setOnibusWifiInfo(wifiMap);
        }

        // Buscar passageiros com dados do cliente
        const { data: passageirosData, error: passageirosError } = await supabase
          .from("viagem_passageiros")
          .select(`
            id,
            cliente_id,
            setor_maracana,
            valor,
            desconto,
            onibus_id,
            cidade_embarque,
            is_responsavel_onibus,
            clientes!viagem_passageiros_cliente_id_fkey (
              id,
              nome,
              telefone,
              cpf,
              foto
            ),
            passageiro_passeios (
              passeio_nome,
              status,
              valor_cobrado,
              passeio:passeios!passeio_id (
                nome,
                valor,
                categoria
              )
            )
          `)
          .eq("viagem_id", id);

        if (passageirosError) throw passageirosError;

        // Formatar dados dos passageiros
        const passageirosFormatados = (passageirosData || []).map((item: any) => ({
          id: item.clientes.id,
          nome: item.clientes.nome,
          telefone: item.clientes.telefone,
          cpf: item.clientes.cpf,
          foto: item.clientes.foto,
          cidade_embarque: item.cidade_embarque,
          setor_maracana: item.setor_maracana,
          valor: item.valor || 0,
          desconto: item.desconto || 0,
          onibus_id: item.onibus_id,
          is_responsavel_onibus: item.is_responsavel_onibus || false,
          cidade: item.clientes.cidade || item.cidade_embarque,
          passageiro_passeios: item.passageiro_passeios || []
        }));

        setTodosPassageiros(passageirosFormatados);

        console.log('✅ Dados da viagem carregados:', {
          viagem: viagemData.adversario,
          onibus: onibusData?.length || 0,
          passageiros: passageirosFormatados.length
        });

      } catch (error) {
        console.error('❌ Erro ao buscar dados da viagem:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDadosViagem();
  }, [authLoading, id]);

  // Filtrar apenas passageiros alocados em ônibus
  const passageirosComOnibus = todosPassageiros.filter(p => p.onibus_id);

  // Carregar imagens dos ônibus
  useEffect(() => {
    const loadBusImages = async () => {
      if (!onibusList.length) return;

      try {
        // Usar a mesma query do ViagemReport
        const { data, error } = await supabase
          .from('onibus_images')
          .select('tipo_onibus, image_url');

        if (error) throw error;

        if (data && data.length > 0) {
          const images: Record<string, string> = {};
          data.forEach(item => {
            if (item.image_url) {
              images[item.tipo_onibus] = item.image_url;
            }
          });

          setBusImages(images);
        }
      } catch (error) {
        console.error('Erro ao carregar imagens dos ônibus:', error);
      }
    };

    if (onibusList.length > 0) {
      loadBusImages();
    }
  }, [onibusList]);

  // Função para buscar passageiro - BUSCA INTELIGENTE
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResult(null);
      setSearchPerformed(false);
      return;
    }

    const term = searchTerm.toLowerCase().trim();

    // Buscar por nome ou CPF usando estrutura do useViagemDetails
    const found = passageirosComOnibus.find(p => {
      const nome = (p.nome || '').toLowerCase();
      const cpf = p.cpf || '';

      // BUSCA POR NOME - mais flexível
      // Remove acentos e permite busca parcial
      const nomeNormalizado = nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, ''); // Remove caracteres especiais

      const termNormalizado = term
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');

      // Busca por palavras individuais (permite busca por nome ou sobrenome)
      const palavrasNome = nomeNormalizado.split(' ').filter(p => p.length > 0);
      const palavrasTerm = termNormalizado.split(' ').filter(p => p.length > 0);

      const nomeMatch = palavrasTerm.every(palavra =>
        palavrasNome.some(nomePalavra => nomePalavra.includes(palavra))
      ) || nomeNormalizado.includes(termNormalizado);

      // BUSCA POR CPF - muito flexível
      // Aceita: 12345678901, 123.456.789-01, 123456789-01, etc.
      const cpfLimpo = cpf.replace(/\D/g, ''); // Remove tudo que não é número
      const termLimpo = term.replace(/\D/g, ''); // Remove tudo que não é número

      const cpfMatch = termLimpo.length >= 3 && cpfLimpo.includes(termLimpo);

      return nomeMatch || cpfMatch;
    });

    setSearchResult(found || null);
    setSearchPerformed(true);
  };

  const getOnibusInfo = (onibusId: string) => {
    return onibusList.find(o => o.id === onibusId);
  };

  const getBusImage = (onibusInfo: any) => {
    // Usar a imagem carregada da tabela onibus_images
    return busImages[onibusInfo?.tipo_onibus] || '/images/onibus-default.jpg';
  };

  const getResponsaveisOnibus = (onibusId: string) => {
    return passageirosComOnibus.filter(p => 
      p.onibus_id === onibusId && p.is_responsavel_onibus === true
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center">
        <div className="text-white text-xl">
          {authLoading ? 'Conectando...' : 'Carregando...'}
        </div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center">
        <div className="text-white text-xl">Viagem não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header com Logos e Efeitos */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-center gap-6">
            {/* Logo Flamengo com animação */}
            {viagem.logo_flamengo && (
              <div className="animate-pulse">
                <img
                  src={viagem.logo_flamengo}
                  alt="Flamengo"
                  className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            
            {/* Título Central */}
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg animate-fade-in">
                🚍 Confira seu Ônibus! 🚍
              </h1>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                <p className="text-lg md:text-xl font-semibold">
                  {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <p className="text-red-100 text-sm">
                📍 Consulte apenas passageiros já alocados nos ônibus
              </p>
            </div>
            
            {/* Logo Adversário com animação */}
            {viagem.logo_adversario && (
              <div className="animate-pulse">
                <img
                  src={viagem.logo_adversario}
                  alt={viagem.adversario}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Onda decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 fill-red-50">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="container py-6 space-y-6 relative z-10">

        {/* Campo de Busca com Efeitos */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-center">
              <div className="animate-bounce mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <span className="text-xl font-bold">Digite seu nome ou CPF</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Ex: João, Silva, 123456789, 123.456.789-00..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="text-lg py-3 border-2 border-red-200 focus:border-red-500 transition-colors duration-300"
              />
              <Button
                onClick={handleSearch}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Busca com Efeitos */}
        {searchPerformed && (
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-8">
            {searchResult ? (
              <div className="text-center">
                {/* Informações do Passageiro com Efeitos */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6 mb-6 shadow-xl">
                    <h2 className="text-3xl font-bold mb-3 animate-pulse">
                      👋 Olá, {searchResult.nome}!
                    </h2>
                    <p className="text-xl font-bold mb-4 animate-bounce">
                      Se prepara, campeão! O Maracanã te espera pra um jogão histórico! 🏟️🔥
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
                    {searchResult.cpf && (
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full shadow-md">
                        📄 CPF: {formatCPF(searchResult.cpf)}
                      </div>
                    )}
                    {searchResult.telefone && (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full shadow-md">
                        📞 {formatPhone(searchResult.telefone)}
                      </div>
                    )}
                  </div>
                  
                  {/* ✅ NOVO: Badge de crédito se aplicável */}
                  {(() => {
                    const creditoBadgeData = useCreditoBadgeType(searchResult);
                    return creditoBadgeData ? (
                      <div className="flex justify-center mb-4">
                        <CreditoBadge 
                          tipo={creditoBadgeData.tipo}
                          valorCredito={creditoBadgeData.valorCredito}
                          valorTotal={creditoBadgeData.valorTotal}
                          size="md"
                        />
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Informações do Ônibus */}
                {searchResult.onibus_id && (() => {
                  const onibusInfo = getOnibusInfo(searchResult.onibus_id);
                  const onibusIndex = onibusList.findIndex(o => o.id === searchResult.onibus_id) + 1;

                  return onibusInfo ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 mb-8 shadow-xl border-2 border-blue-200">
                      <div className="text-center mb-6">
                        <h3 className="text-3xl font-bold text-blue-800 mb-2 animate-pulse">
                          🚌 Você está no ÔNIBUS {onibusIndex} 🚌
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                      </div>

                      {/* Foto do Ônibus e Responsáveis */}
                      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Foto do Ônibus com Efeitos */}
                        <div className="flex justify-center">
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <img
                              src={getBusImage(onibusInfo)}
                              alt={`Ônibus ${onibusInfo.tipo_onibus}`}
                              className="relative w-full max-w-sm rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/images/onibus-default.jpg';
                              }}
                            />
                          </div>
                        </div>

                        {/* Responsáveis do Ônibus com Efeitos */}
                        {(() => {
                          const responsaveis = getResponsaveisOnibus(searchResult.onibus_id);
                          return responsaveis.length > 0 ? (
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                              <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800">
                                👥 Responsáveis do Ônibus
                              </h4>
                              <div className="space-y-3">
                                {responsaveis.map((responsavel, index) => {
                                  const iniciais = responsavel.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                  
                                  return (
                                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                                      <div className="flex items-start gap-4 mb-2">
                                        {/* Foto do Responsável - Quadrada e Maior */}
                                        <div className="flex-shrink-0">
                                          {responsavel.foto ? (
                                            <img
                                              src={responsavel.foto}
                                              alt={responsavel.nome}
                                              className="w-20 h-20 object-cover border-4 border-blue-400 shadow-xl rounded-xl hover:scale-110 transition-transform duration-300"
                                              onError={(e) => {
                                                // Se a imagem falhar, mostrar o fallback
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                              }}
                                            />
                                          ) : null}
                                          {/* Fallback para quando não tem foto ou falha no carregamento */}
                                          <div 
                                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center border-4 border-blue-400 shadow-xl rounded-xl hover:scale-110 transition-transform duration-300"
                                            style={{ 
                                              display: responsavel.foto ? 'none' : 'flex'
                                            }}
                                          >
                                            {iniciais}
                                          </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-blue-800 font-bold text-lg">
                                              {responsavel.nome}
                                            </span>
                                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs shadow-md">
                                              ⭐ Responsável
                                            </Badge>
                                          </div>
                                          {responsavel.telefone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <Phone className="h-3 w-3" />
                                              <span>{formatPhone(responsavel.telefone)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground mt-3">
                                💡 Em caso de dúvidas sobre o ônibus, entre em contato com os responsáveis
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-blue-200">
                              <p className="text-blue-600 text-sm">
                                ℹ️ Nenhum responsável designado para este ônibus ainda
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Detalhes do Ônibus com Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                          <h5 className="font-bold text-blue-800 mb-4 text-lg">🚌 Informações do Ônibus</h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                              <Bus className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-800">Tipo:</span>
                              <span className="text-blue-700 font-semibold">{onibusInfo.tipo_onibus}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                              <Users className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-800">Empresa:</span>
                              <span className="text-blue-700 font-semibold">{onibusInfo.empresa}</span>
                            </div>
                            {onibusInfo.numero_identificacao && (
                              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                <span className="font-medium text-blue-800">Número:</span>
                                <span className="text-blue-700 font-semibold">{onibusInfo.numero_identificacao}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                          <h5 className="font-bold text-green-800 mb-4 text-lg">🎫 Suas Informações</h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Embarque:</span>
                              <span className="text-green-700 font-semibold">{searchResult.cidade_embarque || searchResult.cidade}</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                              <Ticket className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Setor:</span>
                              <span className="text-green-700 font-semibold">{searchResult.setor_maracana}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-6 mb-8 shadow-xl">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">⚠️</div>
                        <p className="text-yellow-800 font-bold text-lg">
                          Você ainda não foi alocado em um ônibus. Entre em contato com a organização.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                  {/* Informações de WiFi - Dados reais do ônibus */}
                  {(() => {
                    const wifiInfo = onibusWifiInfo[searchResult.onibus_id];
                    return wifiInfo && (wifiInfo.wifi_ssid || wifiInfo.wifi_password) ? (
                      <div className="mt-6">
                        <WifiInfo 
                          wifi_ssid={wifiInfo.wifi_ssid}
                          wifi_password={wifiInfo.wifi_password}
                        />
                      </div>
                    ) : null;
                  })()}

                {/* Passeios Contratados com Efeitos */}
                {searchResult.passageiro_passeios && searchResult.passageiro_passeios.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-xl border-2 border-purple-200">
                    <h4 className="text-2xl font-bold mb-6 text-center text-purple-800">
                      🎢 Seus Passeios Contratados 🎢
                    </h4>
                    <div className="flex flex-wrap justify-center gap-4">
                      {searchResult.passageiro_passeios.map((pp: any, index: number) => (
                        <Badge
                          key={index}
                          className={`${(pp.valor_cobrado || 0) > 0
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                            } text-white px-6 py-3 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer`}
                        >
                          {pp.passeio?.nome || pp.passeio_nome || 'Passeio'}
                          {(pp.valor_cobrado || 0) === 0 && ' 🎁'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-8xl mb-6 animate-bounce">😔</div>
                <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-8 shadow-lg border-2 border-red-200">
                  <h3 className="text-2xl font-bold mb-4 text-red-800">
                    Passageiro não encontrado
                  </h3>
                  <p className="text-red-700 text-lg leading-relaxed">
                    Verifique se digitou o nome ou CPF corretamente.
                    <br />
                    <strong>Importante:</strong> Só aparecem passageiros que já foram alocados em ônibus.
                    <br />
                    Se você não foi alocado ainda, entre em contato com a organização.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        {/* Card do Instagram com Efeitos */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
            <CardContent className="p-8">
              <div className="animate-pulse mb-4">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3 text-purple-800">
                  <Instagram className="h-8 w-8 animate-bounce" />
                  📸✨ Siga nosso Instagram! ✨📸
                </h3>
              </div>
              <p className="mb-6 text-lg text-purple-700">
                Siga nosso Instagram e marque a gente nas fotos da sua viagem 📸✨
              </p>
              <a
                href="https://www.instagram.com/neto.viagens?igsh=MWRkODhvbjh3dW1lbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 cursor-pointer"
              >
                <Instagram className="h-10 w-10 animate-spin" />
                @neto.viagens - Clique aqui
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Contato com Efeitos */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-lg font-semibold text-green-800">
                <Phone className="h-5 w-5 inline mr-2 animate-pulse" />
                Dúvidas? Entre em contato: (47) 9 9992-1907
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeuOnibus;