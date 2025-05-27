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
  gradient?: string;
}

export const ModernStatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  change,
  className,
  gradient = "from-blue-500 via-blue-400 to-blue-600"
}: ModernStatCardProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6 border-0 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group",
      className
    )} style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
      {/* Gradiente de fundo customizado */}
      <div className={cn(
        "absolute inset-0 z-0 opacity-90",
        `bg-gradient-to-br ${gradient}`
      )} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300",
            `bg-gradient-to-br ${gradient}`
          )}>
            <Icon className="w-6 h-6 text-white drop-shadow" />
          </div>
          {change && (
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm shadow",
              change.type === 'increase' ? "text-green-600" : "text-red-600"
            )}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-white drop-shadow-sm">{value}</div>
          <div className="text-white/90 text-sm font-medium drop-shadow-sm">{label}</div>
        </div>
      </div>
    </div>
  );
};
