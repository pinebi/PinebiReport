'use client'

import { useResponsive } from '@/hooks/use-responsive'
import { useMobileOptimizations } from '@/hooks/use-responsive'

interface MobileButtonProps {
  children: React.ReactNode
  className?: string
  size?: 'small' | 'default' | 'large'
}

export function MobileButton({ 
  children, 
  className = '',
  size = 'default',
  ...props
}: MobileButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isMobile } = useResponsive()
  const { hoverClass, touchTargetSize, getResponsiveSpacing } = useMobileOptimizations()

  const getSizeClass = () => {
    if (size === 'small') return isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm'
    if (size === 'large') return isMobile ? 'px-6 py-4 text-lg' : 'px-8 py-4 text-lg'
    return isMobile ? 'px-4 py-3 text-base' : 'px-6 py-3 text-base'
  }

  return (
    <button
      className={`
        bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
        transition-colors duration-200
        ${hoverClass}
        ${touchTargetSize}
        ${getSizeClass()}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}













