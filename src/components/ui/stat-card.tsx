
import React from "react";
import { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const StatCard = ({ icon: Icon, value, label }: StatCardProps) => {
  return (
    <GlassCard variant="elevated" className="text-center p-6 hover:scale-105 transition-transform duration-300">
      <Icon className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-red-200 text-sm">{label}</div>
    </GlassCard>
  );
};
