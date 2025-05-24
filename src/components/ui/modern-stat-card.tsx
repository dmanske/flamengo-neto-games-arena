
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
      "relative overflow-hidden rounded-xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-professional-md group",
      className
    )}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change && (
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              change.type === 'increase' ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            )}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-gray-600 text-sm font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
};
