
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

interface ModernToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  icon?: LucideIcon;
  onClose?: () => void;
  className?: string;
}

export const ModernToast = ({ 
  type = 'info', 
  title, 
  description, 
  icon,
  onClose,
  className 
}: ModernToastProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const variants = {
    success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-100",
    error: "bg-red-500/20 border-red-500/30 text-red-100",
    warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-100",
    info: "bg-blue-500/20 border-blue-500/30 text-blue-100"
  };

  const iconColors = {
    success: "text-emerald-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400"
  };

  const Icon = icon || icons[type];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-2xl p-4 min-w-80 max-w-md",
      "animate-in slide-in-from-top-5 fade-in-0 duration-300",
      variants[type],
      className
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 flex items-start gap-3">
        <Icon className={cn("w-6 h-6 flex-shrink-0 mt-0.5", iconColors[type])} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          {description && (
            <p className="text-xs opacity-90 leading-relaxed">{description}</p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center group"
          >
            <XCircle className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
};
