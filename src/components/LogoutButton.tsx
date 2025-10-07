
import React from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

const LogoutButton = () => {
  const { logout, isLoading } = useLogout();

  const handleLogout = async () => {
    console.log("Botão de logout clicado");
    await logout();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-100 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>{isLoading ? "Saindo..." : "Sair"}</span>
    </Button>
  );
};

export default LogoutButton;
