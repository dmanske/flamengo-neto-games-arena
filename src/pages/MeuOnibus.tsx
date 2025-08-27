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

// Usando tipos do hook existente - dados sempre consistentes

const MeuOnibus = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [busImages, setBusImages] = useState<Record<string, string>>({});

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
              valor_cobrado
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {viagem.logo_flamengo && (
              <img
                src={viagem.logo_flamengo}
                alt="Flamengo"
                className="h-12 w-12 object-contain"
              />
            )}
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Confira aqui em qual ônibus você estará 🚍
              </h1>
              <p className="text-red-100 mt-1">
                {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
              <p className="text-red-200 text-sm mt-2">
                📍 Consulte apenas passageiros já alocados nos ônibus
              </p>
            </div>
            {viagem.logo_adversario && (
              <img
                src={viagem.logo_adversario}
                alt={viagem.adversario}
                className="h-12 w-12 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Campo de Busca */}
        <Card className="mb-8 border-white/20 bg-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              <Search className="h-6 w-6 mx-auto mb-2" />
              Digite seu nome ou CPF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Ex: João, Silva, 123456789, 123.456.789-00..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <Button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Busca */}
        {searchPerformed && (
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              {searchResult ? (
                <div className="text-center">
                  {/* Informações do Passageiro */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      👋 Olá, {searchResult.nome}!
                    </h2>
                    <p className="text-xl font-bold text-yellow-300 mb-4">
                      Se prepara, campeão! O Maracanã te espera pra um jogão histórico! 🏟️🔥
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-red-100 mb-3">
                      {searchResult.cpf && (
                        <span>�  CPF: {formatCPF(searchResult.cpf)}</span>
                      )}
                      {searchResult.telefone && (
                        <span>📞 {formatPhone(searchResult.telefone)}</span>
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
                      <div className="bg-white/20 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4">
                          🚌 Você está no ÔNIBUS {onibusIndex}
                        </h3>

                        {/* Foto do Ônibus e Responsáveis */}
                        <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                          {/* Foto do Ônibus */}
                          <div className="flex justify-center">
                            <img
                              src={getBusImage(onibusInfo)}
                              alt={`Ônibus ${onibusInfo.tipo_onibus}`}
                              className="w-full max-w-sm rounded-lg shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/images/onibus-default.jpg';
                              }}
                            />
                          </div>

                          {/* Responsáveis do Ônibus */}
                          {(() => {
                            const responsaveis = getResponsaveisOnibus(searchResult.onibus_id);
                            return responsaveis.length > 0 ? (
                              <div className="bg-white/10 rounded-lg p-4">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  👥 Responsáveis do Ônibus
                                </h4>
                                <div className="space-y-3">
                                  {responsaveis.map((responsavel, index) => {
                                    const iniciais = responsavel.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                    
                                    return (
                                      <div key={index} className="bg-white/10 rounded-lg p-3">
                                        <div className="flex items-start gap-4 mb-2">
                                          {/* Foto do Responsável - Quadrada e Maior */}
                                          <div className="flex-shrink-0">
                                            {responsavel.foto ? (
                                              <img
                                                src={responsavel.foto}
                                                alt={responsavel.nome}
                                                className="w-20 h-20 object-cover border-3 border-yellow-300 shadow-lg"
                                                style={{ borderRadius: '8px' }}
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
                                              className="w-20 h-20 bg-yellow-300 text-black font-bold text-lg flex items-center justify-center border-3 border-yellow-400 shadow-lg"
                                              style={{ 
                                                borderRadius: '8px',
                                                display: responsavel.foto ? 'none' : 'flex'
                                              }}
                                            >
                                              {iniciais}
                                            </div>
                                          </div>
                                          
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-yellow-300 font-semibold">
                                                {responsavel.nome}
                                              </span>
                                              <Badge className="bg-blue-600 text-white text-xs">
                                                Responsável
                                              </Badge>
                                            </div>
                                            {responsavel.telefone && (
                                              <div className="flex items-center gap-2 text-sm text-white/80">
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
                                <p className="text-xs text-white/70 mt-3">
                                  💡 Em caso de dúvidas sobre o ônibus, entre em contato com os responsáveis
                                </p>
                              </div>
                            ) : (
                              <div className="bg-white/10 rounded-lg p-4 text-center">
                                <p className="text-white/80 text-sm">
                                  ℹ️ Nenhum responsável designado para este ônibus ainda
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Detalhes do Ônibus */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white">
                              <Bus className="h-4 w-4" />
                              <span className="font-medium">Tipo:</span>
                              <span>{onibusInfo.tipo_onibus}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">Empresa:</span>
                              <span>{onibusInfo.empresa}</span>
                            </div>
                            {onibusInfo.numero_identificacao && (
                              <div className="flex items-center gap-2 text-white">
                                <span className="font-medium">Número:</span>
                                <span>{onibusInfo.numero_identificacao}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">Embarque:</span>
                              <span>{searchResult.cidade_embarque || searchResult.cidade}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                              <Ticket className="h-4 w-4" />
                              <span className="font-medium">Setor:</span>
                              <span>{searchResult.setor_maracana}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-500/20 rounded-lg p-4 mb-6">
                        <p className="text-yellow-100">
                          ⚠️ Você ainda não foi alocado em um ônibus. Entre em contato com a organização.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Passeios Contratados */}
                  {searchResult.passageiro_passeios && searchResult.passageiro_passeios.length > 0 && (
                    <div className="bg-white/20 rounded-lg p-6">
                      <h4 className="text-lg font-bold text-white mb-3">
                        🎢 Seus Passeios Contratados
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {searchResult.passageiro_passeios.map((pp: any, index: number) => (
                          <Badge
                            key={index}
                            className={`${(pp.valor_cobrado || 0) > 0
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white'
                              } px-3 py-1`}
                          >
                            {pp.passeios?.nome || 'Passeio'}
                            {(pp.valor_cobrado || 0) === 0 && ' 🎁'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">😔</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Passageiro não encontrado
                  </h3>
                  <p className="text-red-100">
                    Verifique se digitou o nome ou CPF corretamente.
                    <br />
                    <strong>Importante:</strong> Só aparecem passageiros que já foram alocados em ônibus.
                    <br />
                    Se você não foi alocado ainda, entre em contato com a organização.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card do Instagram */}
        <div className="mt-8 text-center">
          <Card className="border-white/20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Instagram className="h-6 w-6" />
                📸✨ Siga nosso Instagram!
              </h3>
              <p className="text-white mb-4">
                Siga nosso Instagram e marque a gente nas fotos da sua viagem 📸✨
              </p>
              <a
                href="https://www.instagram.com/neto.viagens?igsh=MWRkODhvbjh3dW1lbg=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-2xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors duration-200 cursor-pointer"
              >
                <Instagram className="h-8 w-8" />
                @neto.viagens - Clique aqui
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Contato */}
        <div className="mt-6 text-center">
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-red-100 text-sm">
                <Phone className="h-4 w-4 inline mr-1" />
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