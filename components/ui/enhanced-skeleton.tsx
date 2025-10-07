'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface EnhancedSkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  animation?: 'pulse' | 'wave' | 'glow'
  children?: React.ReactNode
}

export default function EnhancedSkeleton({ 
  className, 
  variant = 'default',
  animation = 'pulse',
  children 
}: EnhancedSkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    default: 'rounded',
    card: 'rounded-lg',
    text: 'rounded h-4',
    avatar: 'rounded-full',
    button: 'rounded-md'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    glow: 'animate-glow-pulse'
  }
  
  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    animationClasses[animation],
    className
  )
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  )
}

// Pre-built skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <EnhancedSkeleton variant="avatar" className="w-10 h-10" />
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" className="w-3/4" />
        <EnhancedSkeleton variant="text" className="w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }: { rows?: number, className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <EnhancedSkeleton variant="text" className="w-1/4" />
          <EnhancedSkeleton variant="text" className="w-1/3" />
          <EnhancedSkeleton variant="text" className="w-1/4" />
          <EnhancedSkeleton variant="text" className="w-1/6" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <EnhancedSkeleton variant="text" className="w-1/3 h-8" />
        <EnhancedSkeleton variant="text" className="w-1/4 h-4" />
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <EnhancedSkeleton variant="text" className="w-3/4 h-6" />
            <EnhancedSkeleton variant="text" className="w-1/2 h-4" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg space-y-3">
          <EnhancedSkeleton variant="text" className="w-1/3 h-6" />
          <EnhancedSkeleton variant="default" className="w-full h-48" />
        </div>
        <div className="p-4 border rounded-lg space-y-3">
          <EnhancedSkeleton variant="text" className="w-1/3 h-6" />
          <EnhancedSkeleton variant="default" className="w-full h-48" />
        </div>
      </div>
    </div>
  )
}

// Custom CSS animations
const style = `
  @keyframes wave {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes glow-pulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(167, 243, 0, 0.1);
    }
    50% {
      box-shadow: 0 0 20px rgba(167, 243, 0, 0.3);
    }
  }
  
  .animate-wave {
    position: relative;
    overflow: hidden;
  }
  
  .animate-wave::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: wave 2s infinite;
  }
  
  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = style
  document.head.appendChild(styleElement)
}






