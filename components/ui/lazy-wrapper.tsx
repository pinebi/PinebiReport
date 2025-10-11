'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { clsx } from 'clsx'

interface LazyWrapperProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
  minHeight?: string | number
}

export function LazyWrapper({ 
  children, 
  className,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  minHeight = '200px'
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setIsLoaded(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return (
    <div 
      ref={elementRef}
      className={clsx(className)}
      style={{ minHeight: isLoaded ? 'auto' : minHeight }}
    >
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div 
            className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            style={{ minHeight }}
          >
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              Yükleniyor...
            </span>
          </div>
        )
      )}
    </div>
  )
}

// Hook for lazy loading
export function useLazyLoad(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return { elementRef, isVisible }
}
















