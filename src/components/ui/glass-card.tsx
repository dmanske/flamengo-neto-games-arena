
import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive"
  blur?: "sm" | "md" | "lg"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", blur = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 backdrop-blur-md border border-white/20",
      elevated: "bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl",
      interactive: "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
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
          "rounded-xl shadow-xl",
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
