'use client'

import { useResponsive } from '@/hooks/use-responsive'

interface ResponsiveWrapperProps {
  children: React.ReactNode
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
  className?: string
}

export function ResponsiveWrapper({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  className = '' 
}: ResponsiveWrapperProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const getContent = () => {
    if (isMobile && mobile) return mobile
    if (isTablet && tablet) return tablet
    if (isDesktop && desktop) return desktop
    return children
  }

  return (
    <div className={className}>
      {getContent()}
    </div>
  )
}













