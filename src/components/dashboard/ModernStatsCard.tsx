
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton-loader";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  loading?: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient?: string;
}

export const ModernStatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
  trend = "neutral",
  trendValue,
  gradient = "from-blue-50 to-indigo-50"
}: ModernStatsCardProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600", 
    neutral: "text-gray-600"
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-professional min-h-[140px]">
        <div className="flex justify-between items-start mb-4">
          <Skeleton variant="text" width="60%" height="20px" />
          <Skeleton variant="circular" width="48px" height="48px" />
        </div>
        <Skeleton variant="text" width="40%" height="32px" className="mb-2" />
        <Skeleton variant="text" width="80%" height="16px" />
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden p-6 bg-gradient-to-br ${gradient} border border-gray-100 hover:border-gray-200 transition-all duration-200 min-h-[140px] rounded-xl shadow-professional hover:shadow-professional-md`}>
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform duration-300" />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 tracking-wide">
            {title}
          </h3>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 font-sans">
            {value}
          </p>
          
          {(description || trendValue) && (
            <div className="flex items-center gap-2 text-sm">
              {description && (
                <span className="text-gray-600 font-medium">{description}</span>
              )}
              {trendValue && (
                <span className={`font-semibold ${trendColors[trend]}`}>
                  {trend === "up" && "↗"} {trend === "down" && "↘"} {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
