import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
  gradient?: string;
}

export const ModernCard = ({ 
  children, 
  className,
  variant = 'default',
  onClick,
  gradient
}: ModernCardProps) => {
  const baseClasses = "rounded-xl border-0 shadow-xl transition-all duration-300 overflow-hidden";
  
  const variantClasses = {
    default: "bg-white shadow-professional",
    elevated: "bg-white shadow-professional-md border-gray-100",
    interactive: "cursor-pointer hover:scale-105 hover:shadow-2xl"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        gradient ? `bg-gradient-to-br ${gradient}` : "bg-white",
        className
      )}
      onClick={onClick}
      style={gradient ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
