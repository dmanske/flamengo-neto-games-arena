
import React from "react";
import { LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <GlassCard variant="interactive" className="text-center p-8 h-full group">
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-red-200 leading-relaxed">{description}</p>
    </GlassCard>
  );
};
