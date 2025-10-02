import * as React from "react"
import { clsx } from "clsx"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div 
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-blue-500 text-white": variant === 'default',
          "border-transparent bg-gray-500 text-white": variant === 'secondary',
          "border-transparent bg-red-500 text-white": variant === 'destructive',
          "border-gray-300 text-gray-700": variant === 'outline',
        },
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }








