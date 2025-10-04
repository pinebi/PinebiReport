'use client'

import Image from 'next/image'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Skeleton } from './skeleton-loader'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fill?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div 
        className={clsx(
          'bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-xs">Resim yüklenemedi</span>
      </div>
    )
  }

  return (
    <div className={clsx('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton 
            variant="rectangular" 
            width={fill ? '100%' : width} 
            height={fill ? '100%' : height}
            className="rounded-lg"
          />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={clsx(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}

// Avatar component with optimization
interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: number
  className?: string
  fallback?: string
}

export function OptimizedAvatar({ 
  src, 
  alt, 
  size = 40, 
  className,
  fallback 
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false)
  
  const displaySrc = hasError || !src ? null : src
  const displayFallback = fallback || alt.charAt(0).toUpperCase()

  return (
    <div 
      className={clsx(
        'relative rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-medium',
        className
      )}
      style={{ width: size, height: size }}
    >
      {displaySrc ? (
        <OptimizedImage
          src={displaySrc}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full"
          quality={90}
        />
      ) : (
        <span className="text-sm" style={{ fontSize: size * 0.4 }}>
          {displayFallback}
        </span>
      )}
    </div>
  )
}



