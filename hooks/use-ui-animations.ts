'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface AnimationOptions {
  duration?: number
  delay?: number
  easing?: string
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

interface ScrollAnimationOptions extends AnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useUIAnimations() {
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Fade in animation
  const useFadeIn = (options: AnimationOptions = {}) => {
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (isReducedMotion) {
        setIsVisible(true)
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [isReducedMotion])

    const animationStyle = isVisible ? {
      opacity: 1,
      transform: 'translateY(0)',
      transition: `opacity ${options.duration || 600}ms ease-out, transform ${options.duration || 600}ms ease-out`
    } : {
      opacity: 0,
      transform: 'translateY(20px)',
      transition: `opacity ${options.duration || 600}ms ease-out, transform ${options.duration || 600}ms ease-out`
    }

    return { elementRef, animationStyle, isVisible }
  }

  // Slide in from direction
  const useSlideIn = (direction: 'left' | 'right' | 'up' | 'down', options: AnimationOptions = {}) => {
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (isReducedMotion) {
        setIsVisible(true)
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [isReducedMotion, direction])

    const getTransform = () => {
      if (isVisible) return 'translate(0, 0)'
      
      switch (direction) {
        case 'left': return 'translateX(-50px)'
        case 'right': return 'translateX(50px)'
        case 'up': return 'translateY(-50px)'
        case 'down': return 'translateY(50px)'
        default: return 'translateY(20px)'
      }
    }

    const animationStyle = {
      opacity: isVisible ? 1 : 0,
      transform: getTransform(),
      transition: `opacity ${options.duration || 600}ms ease-out, transform ${options.duration || 600}ms ease-out`
    }

    return { elementRef, animationStyle, isVisible }
  }

  // Scale animation
  const useScale = (options: AnimationOptions = {}) => {
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (isReducedMotion) {
        setIsVisible(true)
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [isReducedMotion])

    const animationStyle = {
      opacity: isVisible ? 1 : 0,
      transform: `scale(${isVisible ? 1 : 0.8})`,
      transition: `opacity ${options.duration || 600}ms ease-out, transform ${options.duration || 600}ms ease-out`
    }

    return { elementRef, animationStyle, isVisible }
  }

  // Stagger animation for multiple elements
  const useStagger = (count: number, staggerDelay: number = 100) => {
    const [visibleItems, setVisibleItems] = useState<number[]>([])
    const elementRefs = useRef<(HTMLElement | null)[]>([])

    useEffect(() => {
      if (isReducedMotion) {
        setVisibleItems(Array.from({ length: count }, (_, i) => i))
        return
      }

      const observers = elementRefs.current.map((element, index) => {
        if (!element) return null

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleItems(prev => [...prev, index])
              }, index * staggerDelay)
            }
          },
          { threshold: 0.1 }
        )

        observer.observe(element)
        return observer
      })

      return () => {
        observers.forEach(observer => observer?.disconnect())
      }
    }, [count, staggerDelay, isReducedMotion])

    const getItemStyle = (index: number) => ({
      opacity: visibleItems.includes(index) ? 1 : 0,
      transform: `translateY(${visibleItems.includes(index) ? 0 : 20}px)`,
      transition: `opacity 600ms ease-out ${index * staggerDelay}ms, transform 600ms ease-out ${index * staggerDelay}ms`
    })

    return { elementRefs, getItemStyle, visibleItems }
  }

  // Hover animations
  const useHover = (scale: number = 1.05) => {
    const [isHovered, setIsHovered] = useState(false)

    const hoverProps = {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        transform: isHovered ? `scale(${scale})` : 'scale(1)',
        transition: 'transform 200ms ease-out'
      }
    }

    return { hoverProps, isHovered }
  }

  // Hover scale animation
  const useHoverScale = (options: { scale?: number } = {}) => {
    const [isHovered, setIsHovered] = useState(false)
    const scale = options.scale || 1.05

    const hoverProps = {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      style: {
        transform: isHovered && !isReducedMotion ? `scale(${scale})` : 'scale(1)',
        transition: 'transform 200ms ease-out',
        cursor: 'pointer'
      }
    }

    return { hoverProps, isHovered }
  }

  // Pulse animation
  const usePulse = (options: AnimationOptions = {}) => {
    const [isPulsing, setIsPulsing] = useState(false)

    const startPulse = useCallback(() => {
      if (isReducedMotion) return
      
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), options.duration || 1000)
    }, [isReducedMotion, options.duration])

    const pulseStyle = {
      animation: isPulsing ? `pulse ${options.duration || 1000}ms ease-in-out` : 'none'
    }

    return { pulseStyle, startPulse, isPulsing }
  }

  return {
    isReducedMotion,
    useFadeIn,
    useSlideIn,
    useScale,
    useStagger,
    useHover,
    useHoverScale,
    usePulse
  }
}

// Pre-built animated components




// Custom CSS animations
const animationStyles = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.6s ease-out;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.6s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.6s ease-out;
  }

  .animate-slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  .animate-pulse-custom {
    animation: pulse 1s ease-in-out infinite;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .animate-fade-in-up,
    .animate-fade-in-left,
    .animate-fade-in-right,
    .animate-scale-in,
    .animate-slide-in-up,
    .animate-pulse-custom {
      animation: none;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = animationStyles
  document.head.appendChild(styleElement)
}
