import React, { useState } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Play, Video, Users, Calendar } from "lucide-react";

export const VideoGallerySection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 1,
      title: "Apresentação Neto Tours",
      description: "Conheça nossa empresa e nossa paixão pelo Flamengo",
      thumbnail: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=450&fit=crop",
      duration: "2:30",
      isMain: true,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 2,
      title: "Caravana para o Maracanã",
      description: "Veja como é viajar conosco",
      thumbnail: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&h=450&fit=crop",
      duration: "3:45",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "Festa da Torcida",
      description: "A emoção de cada jogo",
      thumbnail: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=450&fit=crop",
      duration: "1:50",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 4,
      title: "Bastidores da Viagem",
      description: "Os momentos especiais",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop",
      duration: "4:20",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ];

  const mainVideo = videos.find(v => v.isMain);
  const otherVideos = videos.filter(v => !v.isMain);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-black/40 to-red-900/20"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <Video className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">Galeria de Vídeos</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Viva a
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
              Experiência
            </span>
          </h2>
          
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Assista aos nossos vídeos e sinta a emoção de viajar com a Neto Tours. 
            Cada viagem é uma nova aventura rubro-negra.
          </p>
        </div>

        {/* Main Video */}
        {mainVideo && (
          <div className="mb-16">
            <EnhancedCard variant="glass" className="overflow-hidden">
              <div className="relative aspect-video">
                {activeVideo === mainVideo.videoUrl ? (
                  <iframe
                    src={mainVideo.videoUrl}
                    title={mainVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img 
                      src={mainVideo.thumbnail} 
                      alt={mainVideo.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <button
                        onClick={() => setActiveVideo(mainVideo.videoUrl)}
                        className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </button>
                    </div>
                    
                    {/* Video Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          PRINCIPAL
                        </span>
                        <span className="text-yellow-400 text-sm">{mainVideo.duration}</span>
                      </div>
                      <h3 className="text-white font-bold text-2xl mb-2">{mainVideo.title}</h3>
                      <p className="text-red-200">{mainVideo.description}</p>
                    </div>
                  </>
                )}
              </div>
            </EnhancedCard>
          </div>
        )}

        {/* Other Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherVideos.map((video) => (
            <EnhancedCard 
              key={video.id}
              variant="interactive"
              className="group overflow-hidden"
            >
              <div className="relative aspect-video">
                {activeVideo === video.videoUrl ? (
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setActiveVideo(video.videoUrl)}
                        className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </button>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="text-white font-semibold mb-1">{video.title}</h4>
                <p className="text-red-200 text-sm">{video.description}</p>
              </div>
            </EnhancedCard>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Ver Todos os Vídeos
          </button>
        </div>
      </div>
    </section>
  );
};
