'use client'

import { useResponsive } from '@/hooks/use-responsive'
import { useMobileOptimizations } from '@/hooks/use-responsive'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'small' | 'default' | 'large'
}

export function MobileCard({ 
  children, 
  className = '',
  padding = 'default'
}: MobileCardProps) {
  const { isMobile } = useResponsive()
  const { hoverClass, touchTargetSize, getResponsiveSpacing } = useMobileOptimizations()

  const getPaddingClass = () => {
    if (padding === 'none') return ''
    if (padding === 'small') return isMobile ? 'p-2' : 'p-3'
    if (padding === 'large') return isMobile ? 'p-6' : 'p-8'
    return isMobile ? 'p-4' : 'p-6'
  }

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-sm border
      ${hoverClass}
      ${touchTargetSize}
      ${getPaddingClass()}
      ${className}
    `}>
      {children}
    </div>
  )
}






