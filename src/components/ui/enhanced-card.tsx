
import React from "react";
import { cn } from "@/lib/utils";

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'elevated' | 'interactive' | 'minimal';
  glow?: boolean;
  gradient?: string;
  onClick?: () => void;
}

export const EnhancedCard = ({ 
  children, 
  className,
  variant = 'glass',
  glow = false,
  gradient,
  onClick
}: EnhancedCardProps) => {
  const baseClasses = "relative overflow-hidden transition-all duration-500 ease-out";
  
  const variantClasses = {
    glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl",
    elevated: "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl hover:shadow-red-500/20",
    interactive: "bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/30 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 rounded-2xl shadow-lg hover:shadow-2xl",
    minimal: "bg-white/3 backdrop-blur-md border border-white/5 rounded-xl"
  };

  const glowEffect = glow ? "before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/10 before:to-yellow-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-inherit" : "";

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        glowEffect,
        gradient && `bg-gradient-to-br ${gradient}`,
        className
      )}
      onClick={onClick}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60 rounded-inherit"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
    </div>
  );
};
