'use client'

import { useState, useEffect, useCallback } from 'react'

interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

interface ResponsiveState {
  width: number
  height: number
  breakpoint: keyof BreakpointConfig
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
  isPWA: boolean
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'lg',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    isTouchDevice: false,
    isPWA: false
  })

  const getBreakpoint = useCallback((width: number): keyof BreakpointConfig => {
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }, [breakpoints])

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width)
    const isMobile = width < breakpoints.md
    const isTablet = width >= breakpoints.md && width < breakpoints.lg
    const isDesktop = width >= breakpoints.lg
    const orientation = width > height ? 'landscape' : 'portrait'
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://')

    setState({
      width,
      height,
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      isTouchDevice,
      isPWA
    })
  }, [breakpoints, getBreakpoint])

  useEffect(() => {
    updateState()

    const handleResize = () => updateState()
    const handleOrientationChange = () => {
      // Delay to get correct dimensions after orientation change
      setTimeout(updateState, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateState])

  return state
}

// Mobile-specific utilities
export function useMobileOptimizations() {
  const { isMobile, isTouchDevice, isPWA } = useResponsive()

  // Disable hover effects on touch devices
  const hoverClass = isTouchDevice ? '' : 'hover:shadow-lg'
  
  // Adjust touch targets for mobile
  const touchTargetSize = isMobile ? 'min-h-[44px] min-w-[44px]' : ''
  
  // Optimize animations for mobile
  const animationClass = isMobile ? 'transition-transform' : 'transition-all duration-300'
  
  // PWA-specific adjustments
  const pwaPadding = isPWA ? 'pt-safe-area-inset-top pb-safe-area-inset-bottom' : ''

  return {
    hoverClass,
    touchTargetSize,
    animationClass,
    pwaPadding,
    isMobile,
    isTouchDevice,
    isPWA
  }
}

// Responsive grid utilities
export function useResponsiveGrid() {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive()

  const getGridCols = (cols: { xs?: number, sm?: number, md?: number, lg?: number, xl?: number }) => {
    const currentCols = cols[breakpoint] || cols.lg || cols.md || cols.sm || cols.xs || 1
    return `grid-cols-${currentCols}`
  }

  const getResponsiveSpacing = () => {
    if (isMobile) return 'gap-2 p-2'
    if (isTablet) return 'gap-4 p-4'
    return 'gap-6 p-6'
  }

  const getResponsiveTextSize = (size: 'small' | 'medium' | 'large') => {
    const sizes = {
      small: isMobile ? 'text-xs' : 'text-sm',
      medium: isMobile ? 'text-sm' : 'text-base',
      large: isMobile ? 'text-base' : 'text-lg'
    }
    return sizes[size]
  }

  return {
    getGridCols,
    getResponsiveSpacing,
    getResponsiveTextSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop
  }
}

// Mobile navigation utilities
export function useMobileNavigation() {
  const { isMobile } = useResponsive()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    if (isMobile && isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobile, isMenuOpen, closeMenu])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isMobile, isMenuOpen])

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobile
  }
}




// Safe area utilities for mobile devices
export function useSafeArea() {
  const { isMobile, isPWA } = useResponsive()

  const safeAreaInsets = {
    top: isMobile && isPWA ? 'env(safe-area-inset-top)' : '0px',
    right: isMobile && isPWA ? 'env(safe-area-inset-right)' : '0px',
    bottom: isMobile && isPWA ? 'env(safe-area-inset-bottom)' : '0px',
    left: isMobile && isPWA ? 'env(safe-area-inset-left)' : '0px'
  }

  const safeAreaClasses = {
    padding: isMobile && isPWA ? 'pt-safe-area-inset-top pb-safe-area-inset-bottom pl-safe-area-inset-left pr-safe-area-inset-right' : '',
    margin: isMobile && isPWA ? 'mt-safe-area-inset-top mb-safe-area-inset-bottom ml-safe-area-inset-left mr-safe-area-inset-right' : ''
  }

  return {
    safeAreaInsets,
    safeAreaClasses,
    isMobile,
    isPWA
  }
}
