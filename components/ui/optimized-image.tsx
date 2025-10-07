'use client'

import React from 'react'
import { usePerformance } from '@/hooks/use-performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  ...props
}: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const { optimizeImage, useLazyLoad } = usePerformance()
  const { elementRef, isVisible } = useLazyLoad()

  const optimizedSrc = optimizeImage(src, { width, height, quality })

  return (
    <div ref={elementRef} className={className}>
      {isVisible && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
}