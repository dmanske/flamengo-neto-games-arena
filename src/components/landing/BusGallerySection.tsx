
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Bus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BusImage {
  id: string;
  empresa: string;
  tipo_onibus: string;
  image_url: string;
}

const BusGallerySection = () => {
  const { data: busImages, isLoading } = useQuery({
    queryKey: ['bus-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onibus_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusImage[];
    }
  });

  const defaultBusImages = [
    {
      id: '1',
      empresa: 'NetoTours',
      tipo_onibus: 'Executivo',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/LT_471_%28LTZ_1471%29_Arriva_London_New_Routemaster_%2819522859218%29.jpg',
    },
    {
      id: '2',
      empresa: 'NetoTours',
      tipo_onibus: 'Leito',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/ANA_Lima_Volvo.jpg/1200px-ANA_Lima_Volvo.jpg',
    },
    {
      id: '3',
      empresa: 'NetoTours',
      tipo_onibus: 'Semi-leito',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Scania_OmniExpress.JPG',
    },
  ];

  const images = busImages?.length ? busImages : defaultBusImages;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <Bus className="h-8 w-8 text-red-600 mr-3" />
          <h2 className="text-3xl md:text-4xl font-bold text-center">Conheça Nossos Ônibus</h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel>
            <CarouselContent>
              {images.map((bus) => (
                <CarouselItem key={bus.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden border-none shadow-md mx-2">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={bus.image_url} 
                        alt={`${bus.empresa} - ${bus.tipo_onibus}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 bg-white">
                      <h3 className="font-bold text-lg">{bus.tipo_onibus}</h3>
                      <p className="text-gray-700">{bus.empresa}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-4 bg-white shadow-md" />
              <CarouselNext className="-right-4 bg-white shadow-md" />
            </div>
          </Carousel>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Ar-condicionado</h3>
              <p className="text-gray-600">Viagem confortável mesmo nos dias mais quentes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Poltronas Reclináveis</h3>
              <p className="text-gray-600">Descanse durante o trajeto em assentos confortáveis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Wi-Fi a Bordo</h3>
              <p className="text-gray-600">Mantenha-se conectado durante toda a viagem</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusGallerySection;
