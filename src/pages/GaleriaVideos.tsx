
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Play, Trophy, MapPin, Calendar, Users, Eye, Share2, 
  ArrowLeft, Search, Clock, Download 
} from "lucide-react";

const GaleriaVideos = () => {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [videoSelecionado, setVideoSelecionado] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const categorias = [
    { id: 'todas', nome: 'Todos os Vídeos', icon: Video },
    { id: 'gols', nome: 'Gols', icon: Trophy },
    { id: 'viagens', nome: 'Viagens', icon: MapPin },
    { id: 'torcida', nome: 'Torcida', icon: Users },
    { id: 'entrevistas', nome: 'Entrevistas', icon: Video }
  ];

  const gameVideos = [
    {
      id: 1,
      title: "Gol do Título da Libertadores 2022",
      description: "O gol que fez o Brasil inteiro chorar de emoção. Gabigol marca e garante o bicampeonato da América",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop",
      duration: "2:15",
      date: "29 de Outubro, 2022",
      local: "Estádio Monumental, Guayaquil",
      categoria: "gols",
      views: "2.5M",
      likes: "189k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      id: 2,
      title: "Chegada da Caravana ao Maracanã",
      description: "A emocionante chegada dos rubro-negros ao templo sagrado do futebol brasileiro",
      thumbnail: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=450&fit=crop",
      duration: "5:30",
      date: "15 de Abril, 2023",
      local: "Maracanã, Rio de Janeiro",
      categoria: "viagens",
      views: "892k",
      likes: "67k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    {
      id: 3,
      title: "Festa da Torcida no Ônibus",
      description: "A celebração não para! Confira como foi a volta pra casa após mais uma vitória",
      thumbnail: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=450&fit=crop",
      duration: "8:45",
      date: "22 de Julho, 2024",
      local: "Voltando de Curitiba",
      categoria: "viagens",
      views: "456k",
      likes: "34k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      id: 4,
      title: "Arrascaeta - Golaço de Falta",
      description: "Uma cobrança de falta perfeita que entrou para a história do clube",
      thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=450&fit=crop",
      duration: "1:45",
      date: "18 de Setembro, 2024",
      local: "Maracanã, Rio de Janeiro",
      categoria: "gols",
      views: "1.2M",
      likes: "98k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    {
      id: 5,
      title: "Entrevista com Filipe Luís",
      description: "O técnico fala sobre a temporada e os próximos desafios do Mengão",
      thumbnail: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=450&fit=crop",
      duration: "12:30",
      date: "05 de Outubro, 2024",
      local: "Ninho do Urubu, Rio de Janeiro",
      categoria: "entrevistas",
      views: "234k",
      likes: "18k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    },
    {
      id: 6,
      title: "Mosaico 3D da Torcida",
      description: "A incrível coreografia da Nação Rubro-Negra vista de todos os ângulos",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop",
      duration: "3:20",
      date: "25 de Agosto, 2024",
      local: "Maracanã, Rio de Janeiro",
      categoria: "torcida",
      views: "678k",
      likes: "52k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    },
    {
      id: 7,
      title: "Bastidores da Conquista",
      description: "Veja como foi a preparação e os momentos únicos da conquista do título",
      thumbnail: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=450&fit=crop",
      duration: "15:45",
      date: "19 de Outubro, 2024",
      local: "Arena do Grêmio, Porto Alegre",
      categoria: "viagens",
      views: "1.8M",
      likes: "145k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    },
    {
      id: 8,
      title: "Top 10 Gols da Temporada",
      description: "Os gols mais bonitos e importantes da temporada 2024 do Flamengo",
      thumbnail: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop",
      duration: "6:15",
      date: "10 de Dezembro, 2024",
      local: "Compilação Geral",
      categoria: "gols",
      views: "3.2M",
      likes: "287k",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    }
  ];

  const videosFiltrados = gameVideos.filter(video => {
    const matchCategoria = filtroCategoria === 'todas' || video.categoria === filtroCategoria;
    const matchBusca = termoBusca === '' || 
      video.title.toLowerCase().includes(termoBusca.toLowerCase()) ||
      video.description.toLowerCase().includes(termoBusca.toLowerCase()) ||
      video.local.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 to-black/50"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate("/")} 
              variant="ghost" 
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
              <Video className="w-5 h-5 text-red-400" />
              <span className="text-red-100 font-medium">Canal Oficial</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Galeria de
              <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
                Vídeos Exclusivos
              </span>
            </h1>
            
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Assista aos melhores momentos, gols históricos e bastidores exclusivos 
              das nossas viagens e jogos do Mengão.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Controles */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-red-300" />
                <Input
                  placeholder="Buscar vídeos..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10 bg-white/10 border-red-500/30 text-white placeholder:text-red-300"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => {
              const IconComponent = categoria.icon;
              return (
                <Button
                  key={categoria.id}
                  variant={filtroCategoria === categoria.id ? 'default' : 'outline'}
                  onClick={() => setFiltroCategoria(categoria.id)}
                  size="sm"
                  className={filtroCategoria === categoria.id 
                    ? 'bg-red-600' 
                    : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                  }
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {categoria.nome}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <EnhancedCard variant="glass" className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{videosFiltrados.length}</div>
            <div className="text-red-300 text-sm">Vídeos Encontrados</div>
          </EnhancedCard>
          <EnhancedCard variant="glass" className="p-4 text-center">
            <div className="text-2xl font-bold text-white">12.5M</div>
            <div className="text-red-300 text-sm">Total de Views</div>
          </EnhancedCard>
          <EnhancedCard variant="glass" className="p-4 text-center">
            <div className="text-2xl font-bold text-white">890k</div>
            <div className="text-red-300 text-sm">Total de Likes</div>
          </EnhancedCard>
          <EnhancedCard variant="glass" className="p-4 text-center">
            <div className="text-2xl font-bold text-white">2.3k</div>
            <div className="text-red-300 text-sm">Horas de Conteúdo</div>
          </EnhancedCard>
        </div>

        {/* Grid de Vídeos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {videosFiltrados.map((video, index) => (
            <EnhancedCard 
              key={video.id}
              variant="interactive"
              className="group overflow-hidden cursor-pointer"
              glow={index < 3}
              onClick={() => setVideoSelecionado(video)}
            >
              <div className="relative aspect-video">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                
                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md rounded px-2 py-1 text-white text-xs">
                  {video.duration}
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-600/80 text-white">
                    {categorias.find(c => c.id === video.categoria)?.nome}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 backdrop-blur-md">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-red-200 text-sm mb-3 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center justify-between text-sm text-red-300">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(video.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-red-300 text-xs mt-2">
                  <MapPin className="w-3 h-3" />
                  {video.local}
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
        
        <div className="text-center">
          <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Carregar Mais Vídeos
          </Button>
        </div>
      </div>

      {/* Modal de Vídeo */}
      {videoSelecionado && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVideoSelecionado(null)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setVideoSelecionado(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="aspect-video">
                <video 
                  src={videoSelecionado.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={videoSelecionado.thumbnail}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <Badge className="bg-red-600 text-white mb-2">
                    {categorias.find(c => c.id === videoSelecionado.categoria)?.nome}
                  </Badge>
                  <h3 className="text-white font-bold text-2xl mb-2">{videoSelecionado.title}</h3>
                  <p className="text-red-200 mb-3">{videoSelecionado.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-red-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {videoSelecionado.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {videoSelecionado.local}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {videoSelecionado.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {videoSelecionado.views} views
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaVideos;
