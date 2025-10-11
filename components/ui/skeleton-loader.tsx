'use client'

import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height, 
  animation = 'pulse' 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: ''
  }
  
  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  )
}

// Predefined skeleton components
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '75%' : '100%'} 
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('border border-gray-200 dark:border-gray-700 rounded-lg p-4', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4, className }: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              height={16}
              width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '100%'}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonNavigation({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton variant="rectangular" width={20} height={20} />
          <Skeleton variant="text" width={Math.random() * 40 + 60 + '%'} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
            <Skeleton variant="text" width="80%" height={24} className="mb-2" />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <Skeleton variant="text" width={200} height={24} className="mb-4" />
        <Skeleton variant="rectangular" width="100%" height={300} />
      </div>
      
      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <Skeleton variant="text" width={150} height={24} className="mb-4" />
        <SkeletonTable rows={5} columns={4} />
      </div>
    </div>
  )
}
















