
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const FloatingActionButton = ({ 
  icon: Icon, 
  onClick, 
  className,
  variant = 'primary',
  size = 'md',
  tooltip
}: FloatingActionButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-professional-lg",
    secondary: "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-professional-lg",
    accent: "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-professional-lg"
  };

  const sizes = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6", 
    lg: "w-7 h-7"
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded-full border border-gray-200 transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-professional-lg",
          variants[variant],
          sizes[size],
          "flex items-center justify-center",
          className
        )}
        title={tooltip}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        
        <Icon className={cn(iconSizes[size], "relative z-10 drop-shadow-sm")} />
      </button>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-700">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};
