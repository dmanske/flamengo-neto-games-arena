
import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const { signOut, isLoading } = useAuth();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
      disabled={isLoading}
      className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-100"
    >
      <LogOut className="w-4 h-4" />
      <span>Sair</span>
    </Button>
  );
};

export default LogoutButton;
