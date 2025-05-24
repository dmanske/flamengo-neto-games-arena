
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
    primary: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg shadow-slate-500/25",
    accent: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25"
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
          "relative overflow-hidden rounded-full backdrop-blur-md border border-slate-600/50 transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-2xl",
          variants[variant],
          sizes[size],
          "flex items-center justify-center",
          className
        )}
        title={tooltip}
      >
        {/* Professional animated background */}
        <div className="absolute inset-0 bg-slate-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        
        <Icon className={cn(iconSizes[size], "relative z-10 drop-shadow-sm")} />
      </button>
      
      {/* Professional Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap backdrop-blur-sm border border-slate-600/50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/90"></div>
        </div>
      )}
    </div>
  );
};
