
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, error, success, value, onChange, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    React.useEffect(() => {
      setHasValue(Boolean(value))
    }, [value])

    const handleFocus = () => setFocused(true)
    const handleBlur = () => setFocused(false)

    const isFloating = focused || hasValue

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={cn(
            "peer w-full px-4 pt-6 pb-2 text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rome-terracotta/50 focus:border-rome-terracotta/60",
            error && "border-red-400 focus:ring-red-400/50 focus:border-red-400",
            success && "border-green-400 focus:ring-green-400/50 focus:border-green-400",
            className
          )}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          {...props}
        />
        <label
          className={cn(
            "absolute left-4 text-gray-600 transition-all duration-200 pointer-events-none",
            isFloating 
              ? "top-2 text-xs font-medium text-rome-terracotta" 
              : "top-1/2 -translate-y-1/2 text-base"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-xs text-red-500 animate-fade-in">{error}</p>
        )}
      </div>
    )
  }
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
