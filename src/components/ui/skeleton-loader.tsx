
import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card"
  width?: string | number
  height?: string | number
  lines?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", width, height, lines = 1, ...props }, ref) => {
    const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"
    
    const variants = {
      text: "h-4 rounded",
      rectangular: "rounded-lg", 
      circular: "rounded-full",
      card: "rounded-xl"
    }

    if (variant === "text" && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                variants.text,
                index === lines - 1 ? "w-3/4" : "w-full",
                className
              )}
              style={{ width: index === lines - 1 ? "75%" : width, height }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        style={{ width, height }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
