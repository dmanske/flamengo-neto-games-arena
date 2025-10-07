import { useState } from "react";
import { Play } from "lucide-react";
import videoThumbnail from "@/assets/landing/video-thumbnail.png";

const VideoTestimonial = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = "https://www.youtube.com/embed/qYXGkdITG84";

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Depoimentos em Vídeo
          </h2>
          <p className="text-muted-foreground text-lg">
            Assista aos relatos emocionantes de quem viveu a experiência
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 0 40px 8px hsl(var(--primary) / 0.5)",
            }}
          >
            <div className="relative pb-[56.25%] h-0">
              {!isPlaying ? (
                <div 
                  className="absolute top-0 left-0 w-full h-full cursor-pointer group"
                  onClick={() => setIsPlaying(true)}
                >
                  <img 
                    src={videoThumbnail} 
                    alt="Depoimento em vídeo" 
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center transition-all transform group-hover:scale-110">
                      <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${videoUrl}?autoplay=1`}
                  title="Depoimento Neto Tours"
                  className="absolute top-0 left-0 w-full h-full rounded-2xl"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonial;
