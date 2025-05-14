import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  iconContainerClassName?: string;
  loading?: boolean;
  hideDescription?: boolean;
  color?: string;
}

export const DashboardStatCard = ({
  title,
  value,
  description = "",
  icon: Icon,
  className = "",
  iconClassName = "",
  iconContainerClassName = "",
  loading = false,
  hideDescription = false,
  color = "bg-gradient-to-br from-red-100 via-yellow-100 to-rose-50"
}: DashboardStatCardProps) => {
  return (
    <Card className={`roman-card ${color} border-0 shadow-md ${className}`} style={{ minHeight: 120 }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="stat-label text-lg font-cinzel text-rome-terracotta">{title}</CardTitle>
          <div className={`p-2 rounded-full shadow-sm ${iconContainerClassName} bg-white/80`}> 
            <Icon className={`h-6 w-6 ${iconClassName}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`stat-value text-3xl font-bold text-rome-navy mb-0 ${hideDescription ? 'text-center w-full' : ''}`}>{loading ? "..." : value}</p>
        {!hideDescription && description && (
          <p className="stat-desc italic text-rome-leaf text-sm mt-1">{loading ? "Carregando..." : description}</p>
        )}
      </CardContent>
    </Card>
  );
};
