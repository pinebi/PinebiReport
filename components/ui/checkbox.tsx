"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            h-4 w-4 rounded-sm border-2 border-gray-300 bg-white transition-colors
            ${checked ? 'bg-blue-600 border-blue-600' : 'hover:border-gray-400'}
            ${className || ''}
          `}
        >
          {checked && (
            <Check className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
