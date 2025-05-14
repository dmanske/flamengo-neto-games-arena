
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  iconContainerClassName?: string;
  loading?: boolean;
}

export const DashboardStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  className = "",
  iconClassName = "",
  iconContainerClassName = "",
  loading = false
}: DashboardStatCardProps) => {
  return (
    <Card className={`overflow-hidden border-0 shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className={`p-2 rounded-full shadow-sm ${iconContainerClassName}`}>
            <Icon className={`h-5 w-5 ${iconClassName}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{loading ? "..." : value}</p>
        <CardDescription>{loading ? "Carregando..." : description}</CardDescription>
      </CardContent>
    </Card>
  );
};
