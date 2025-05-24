
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export const ModernStatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  change,
  className 
}: ModernStatCardProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 group",
      className
    )}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change && (
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              change.type === 'increase' ? "text-green-400 bg-green-400/20" : "text-red-400 bg-red-400/20"
            )}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-white/70 text-sm font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
};
