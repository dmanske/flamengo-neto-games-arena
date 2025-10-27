import maracanaImg from "@/assets/landing/maracana.png";

interface TripBannerProps {
  title: string;
  flamengoLogo: string;
  opponentLogo: string;
  championship: string;
  logoOrder?: {
    primeiro: string;
    segundo: string;
  };
}

const TripBanner = ({ title, flamengoLogo, opponentLogo, championship, logoOrder }: TripBannerProps) => {
  // Usar logoOrder se fornecido, senão usar a ordem padrão
  const primeiroLogo = logoOrder?.primeiro || flamengoLogo;
  const segundoLogo = logoOrder?.segundo || opponentLogo;
  return (
    <div className="relative h-56 overflow-hidden">
      {/* Background do Maracanã */}
      <div 
        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
        style={{ backgroundImage: `url(${maracanaImg})` }}
      />
      
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      

      
      {/* Logos dos Times */}
      <div className="absolute inset-0 flex items-center justify-center gap-8 z-10">
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
          <img 
            src={primeiroLogo} 
            alt="Primeiro Time" 
            className="h-20 w-20 object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="text-white text-4xl font-bold drop-shadow-lg">VS</div>
        
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
          <img 
            src={segundoLogo} 
            alt="Segundo Time" 
            className="h-20 w-20 object-contain drop-shadow-2xl"
          />
        </div>
      </div>
      
      {/* Título do Jogo */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg text-center">
          {title}
        </h3>
      </div>
    </div>
  );
};

export default TripBanner;
