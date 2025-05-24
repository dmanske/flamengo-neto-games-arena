
import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive"
  blur?: "sm" | "md" | "lg"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", blur = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/80 backdrop-blur-sm border border-gray-200/60",
      elevated: "bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-professional-lg",
      interactive: "bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-white/90 hover:border-gray-300/80 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
    }

    const blurLevels = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md", 
      lg: "backdrop-blur-lg"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl shadow-professional",
          variants[variant],
          blurLevels[blur],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
