
import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
}

export const ModernCard = ({ 
  children, 
  className,
  variant = 'default',
  onClick
}: ModernCardProps) => {
  const baseClasses = "rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300";
  
  const variantClasses = {
    default: "",
    elevated: "shadow-2xl bg-white/20 border-white/30",
    interactive: "hover:bg-white/20 hover:border-white/40 cursor-pointer transform hover:scale-[1.02] hover:shadow-xl"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
