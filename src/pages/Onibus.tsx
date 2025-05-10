
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Onibus = () => {
  const busList = [
    {
      type: "43 Leitos Totais",
      companies: ["Bertoldo", "Majetur", "Sarcella"],
      imageUrl: "https://via.placeholder.com/400x250?text=43+Leitos+Totais"
    },
    {
      type: "52 Leitos Master",
      companies: ["HG TUR", "Bertoldo"],
      imageUrl: "https://via.placeholder.com/400x250?text=52+Leitos+Master"
    },
    {
      type: "56 Leitos Master",
      companies: ["Bertoldo", "Sarcella"],
      imageUrl: "https://via.placeholder.com/400x250?text=56+Leitos+Master"
    }
  ];

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold text-secondary mb-6">Ônibus</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {busList.map((bus, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={bus.imageUrl} 
                alt={`Imagem do ônibus ${bus.type}`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{bus.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-semibold mb-2">Empresas:</h3>
              <div className="space-y-1">
                {bus.companies.map((company, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>{company}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Onibus;
