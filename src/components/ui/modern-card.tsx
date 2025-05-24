
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
  const baseClasses = "rounded-xl bg-white border border-gray-100 transition-all duration-300";
  
  const variantClasses = {
    default: "shadow-professional",
    elevated: "shadow-professional-md border-gray-100",
    interactive: "hover:border-gray-200 hover:shadow-professional-md cursor-pointer transform hover:scale-[1.02]"
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
