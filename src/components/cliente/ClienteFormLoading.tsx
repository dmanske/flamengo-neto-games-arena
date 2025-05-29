
import React from "react";
import { Loader2 } from "lucide-react";

export const ClienteFormLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Carregando informações do cliente...
    </div>
  );
};
