
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
    glass: "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-2xl",
    elevated: "bg-slate-900/90 backdrop-blur-2xl border border-slate-600/50 shadow-2xl rounded-3xl hover:shadow-blue-500/20",
    interactive: "bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/60 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 rounded-2xl shadow-lg hover:shadow-2xl",
    minimal: "bg-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-xl"
  };

  const glowEffect = glow ? "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-inherit" : "";

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
      {/* Professional inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 via-transparent to-transparent opacity-60 rounded-inherit"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Professional animated border */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
    </div>
  );
};
