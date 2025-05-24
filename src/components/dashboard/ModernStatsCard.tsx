
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
  gradient = "from-rome-terracotta/20 to-rome-red/10"
}: ModernStatsCardProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600", 
    neutral: "text-gray-600"
  };

  if (loading) {
    return (
      <GlassCard variant="elevated" className="p-6 min-h-[140px]">
        <div className="flex justify-between items-start mb-4">
          <Skeleton variant="text" width="60%" height="20px" />
          <Skeleton variant="circular" width="48px" height="48px" />
        </div>
        <Skeleton variant="text" width="40%" height="32px" className="mb-2" />
        <Skeleton variant="text" width="80%" height="16px" />
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      variant="elevated" 
      className={`group relative overflow-hidden p-6 bg-gradient-to-br ${gradient} border-white/30 hover:border-white/50 transition-all duration-300 min-h-[140px]`}
    >
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-cinzel font-semibold text-rome-navy tracking-wide">
            {title}
          </h3>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-6 w-6 text-rome-terracotta" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-rome-navy font-sans">
            {value}
          </p>
          
          {(description || trendValue) && (
            <div className="flex items-center gap-2 text-sm">
              {description && (
                <span className="text-rome-leaf font-medium">{description}</span>
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
    </GlassCard>
  );
};
