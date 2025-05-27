
import React, { useState } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Camera, Trophy, Heart, MapPin, Calendar, Users, Eye, Download, Share2 } from "lucide-react";

export const GamePhotosSection = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [fotoSelecionada, setFotoSelecionada] = useState<any>(null);

  const categorias = [
    { id: 'todas', nome: 'Todas as Fotos', icon: Camera },
    { id: 'jogos', nome: 'Jogos', icon: Trophy },
    { id: 'viagens', nome: 'Viagens', icon: MapPin },
    { id: 'torcida', nome: 'Torcida', icon: Users }
  ];

  const gamePhotos = [
    {
      id: 1,
      title: "Final da Libertadores 2022",
      description: "Flamengo Campeão da América! Gol do Gabigol aos 43 do segundo tempo",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      date: "29 de Outubro, 2022",
      local: "Estádio Monumental, Guayaquil",
      categoria: "jogos",
      views: "125.3k",
      likes: "89.2k"
    },
    {
      id: 2,
      title: "Maracanã Lotado",
      description: "80 mil rubro-negros cantando em coro no templo do futebol",
      image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop",
      date: "15 de Abril, 2023",
      local: "Maracanã, Rio de Janeiro",
      categoria: "torcida",
      views: "98.7k",
      likes: "76.1k"
    },
    {
      id: 3,
      title: "Caravana Neto Tours",
      description: "Nossa delegação chegando ao estádio com estilo e paixão",
      image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=600&fit=crop",
      date: "22 de Julho, 2024",
      local: "Arena da Baixada, Curitiba",
      categoria: "viagens",
      views: "67.4k",
      likes: "52.8k"
    },
    {
      id: 4,
      title: "Gol Histórico do Arrascaeta",
      description: "Momento épico que ficará marcado na história do clube",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
      date: "18 de Setembro, 2024",
      local: "Maracanã, Rio de Janeiro",
      categoria: "jogos",
      views: "156.9k",
      likes: "112.3k"
    },
    {
      id: 5,
      title: "Concentração Pré-Jogo",
      description: "O ritual sagrado antes de cada partida da Nação",
      image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop",
      date: "05 de Outubro, 2024",
      local: "Ninho do Urubu, Rio de Janeiro",
      categoria: "jogos",
      views: "43.2k",
      likes: "31.7k"
    },
    {
      id: 6,
      title: "Festa da Torcida no Ônibus",
      description: "A comemoração não para nem durante a viagem de volta",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      date: "12 de Novembro, 2024",
      local: "Voltando de São Paulo",
      categoria: "viagens",
      views: "81.5k",
      likes: "64.2k"
    },
    {
      id: 7,
      title: "Mosaico da Torcida",
      description: "Arquibancada vermelha e preta em perfeita sincronia",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
      date: "25 de Agosto, 2024",
      local: "Maracanã, Rio de Janeiro",
      categoria: "torcida",
      views: "134.7k",
      likes: "95.8k"
    },
    {
      id: 8,
      title: "Troféu da Copa do Brasil",
      description: "O momento da conquista que emocionou o Brasil inteiro",
      image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop",
      date: "19 de Outubro, 2024",
      local: "Arena do Grêmio, Porto Alegre",
      categoria: "jogos",
      views: "201.4k",
      likes: "178.9k"
    },
    {
      id: 9,
      title: "Embarque da Caravana",
      description: "O início de mais uma jornada rumo à vitória",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop",
      date: "30 de Setembro, 2024",
      local: "Terminal Rodoviário, Blumenau",
      categoria: "viagens",
      views: "29.8k",
      likes: "24.1k"
    }
  ];

  const fotosFiltradas = filtroCategoria === 'todas' 
    ? gamePhotos 
    : gamePhotos.filter(foto => foto.categoria === filtroCategoria);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-red-900/20 to-black/80"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <Camera className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">Galeria de Momentos</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Momentos
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
              Inesquecíveis
            </span>
          </h2>
          
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Reviva os melhores momentos do Mengão através da nossa galeria exclusiva. 
            Cada foto conta uma história de paixão, vitória e amor pelo clube.
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categorias.map((categoria) => {
            const IconComponent = categoria.icon;
            return (
              <button
                key={categoria.id}
                onClick={() => setFiltroCategoria(categoria.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  filtroCategoria === categoria.id
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 backdrop-blur-md text-red-200 hover:bg-white/20'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {categoria.nome}
              </button>
            );
          })}
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {fotosFiltradas.map((photo, index) => (
            <EnhancedCard 
              key={photo.id}
              variant="interactive"
              className="group overflow-hidden h-80 cursor-pointer"
              glow={index < 3}
              onClick={() => setFotoSelecionada(photo)}
            >
              <div className="relative h-full">
                <img 
                  src={photo.image} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Stats */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-black/50 backdrop-blur-md rounded-lg px-2 py-1 text-white text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {photo.views}
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-lg px-2 py-1 text-white text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {photo.likes}
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">{photo.date}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{photo.title}</h3>
                  <p className="text-red-200 text-sm mb-2">{photo.description}</p>
                  <div className="flex items-center gap-1 text-red-300 text-xs">
                    <MapPin className="w-3 h-3" />
                    {photo.local}
                  </div>
                </div>
                
                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-3">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
        
        <div className="text-center">
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Carregar Mais Fotos
          </button>
        </div>
      </div>

      {/* Modal de Foto Ampliada */}
      {fotoSelecionada && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setFotoSelecionada(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setFotoSelecionada(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            
            <img 
              src={fotoSelecionada.image} 
              alt={fotoSelecionada.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white font-bold text-2xl mb-2">{fotoSelecionada.title}</h3>
              <p className="text-red-200 mb-3">{fotoSelecionada.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-red-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {fotoSelecionada.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {fotoSelecionada.local}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
