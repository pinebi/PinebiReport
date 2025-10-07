'use client'

import { forwardRef, useCallback } from 'react'
import { clsx } from 'clsx'
import { useAccessibility } from '@/hooks/use-accessibility'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  tooltip?: string
  announceClick?: boolean
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    children, 
    className,
    tooltip,
    announceClick = false,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const { announce } = useAccessibility()

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return

      if (onClick) {
        onClick(e)
      }

      if (announceClick) {
        announce(`Buton tıklandı: ${typeof children === 'string' ? children : 'İşlem'}`)
      }
    }, [onClick, loading, disabled, announceClick, children, announce])

    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg'
    }

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={tooltip}
        aria-describedby={tooltip ? `${props.id}-tooltip` : undefined}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Yükleniyor...
          </>
        ) : (
          children
        )}
        
        {tooltip && (
          <span id={`${props.id}-tooltip`} className="sr-only">
            {tooltip}
          </span>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'









