'use client'

import React from 'react'

interface PinebiLoaderProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
}

export default function PinebiLoader({ 
  size = 'medium', 
  text = 'Yükleniyor...', 
  fullScreen = false 
}: PinebiLoaderProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50'
    : 'flex flex-col items-center justify-center p-4'

  return (
    <div className={containerClasses}>
      {/* Pinebi Logo Animation */}
      <div className={`${sizeClasses[size]} relative mb-4`}>
        {/* Ana Logo Şekli - Lime Green */}
        <div className="absolute inset-0">
          {/* Sol dikey bar */}
          <div className="absolute left-0 top-0 w-1 h-full bg-[#A7F300] rounded-full animate-pulse"></div>
          
          {/* Orta yatay bar */}
          <div className="absolute left-1 top-2 w-3 h-1 bg-[#A7F300] rounded-full animate-bounce"></div>
          
          {/* Üst dikey bar */}
          <div className="absolute left-1 top-0 w-1 h-2 bg-[#A7F300] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          
          {/* Sağ üçgen */}
          <div className="absolute left-4 top-1">
            <div className="w-0 h-0 border-l-[6px] border-l-[#A7F300] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent animate-spin" style={{animationDuration: '2s'}}></div>
          </div>
          
          {/* Sağ yatay bar */}
          <div className="absolute left-6 top-2 w-4 h-1 bg-[#A7F300] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 w-1 h-full bg-[#A7F300] rounded-full opacity-30 blur-sm animate-pulse"></div>
          <div className="absolute left-1 top-2 w-3 h-1 bg-[#A7F300] rounded-full opacity-30 blur-sm animate-bounce"></div>
          <div className="absolute left-1 top-0 w-1 h-2 bg-[#A7F300] rounded-full opacity-30 blur-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute left-6 top-2 w-4 h-1 bg-[#A7F300] rounded-full opacity-30 blur-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Rotating Ring */}
        <div className="absolute inset-0 border-2 border-[#A7F300] border-opacity-20 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
        <div className="absolute inset-1 border border-[#00568C] border-opacity-30 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
      </div>

      {/* Pinebi Text */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-[#00568C] font-bold text-xl">Pinebi</span>
        </div>
        <div className="text-[#00568C] text-xs font-medium mb-3">SOFTWARE SOLUTIONS</div>
        
        {/* Loading Text */}
        <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium mb-4`}>
          {text}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-[#A7F300] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#A7F300] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-[#A7F300] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      {/* Additional Loading Bars */}
      <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#A7F300] to-[#00568C] rounded-full animate-pulse" style={{
          animation: 'loading-bar 2s ease-in-out infinite'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 100%;
            transform: translateX(0%);
          }
          100% {
            width: 100%;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

// Compact version for smaller spaces
export function PinebiLoaderCompact({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Ana Logo Şekli */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 w-0.5 h-full bg-[#A7F300] rounded-full animate-pulse"></div>
          <div className="absolute left-0.5 top-1 w-2 h-0.5 bg-[#A7F300] rounded-full animate-bounce"></div>
          <div className="absolute left-0.5 top-0 w-0.5 h-1 bg-[#A7F300] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute left-3 top-0.5">
            <div className="w-0 h-0 border-l-[4px] border-l-[#A7F300] border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent animate-spin" style={{animationDuration: '2s'}}></div>
          </div>
          <div className="absolute left-4 top-1 w-3 h-0.5 bg-[#A7F300] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Rotating Ring */}
        <div className="absolute inset-0 border border-[#A7F300] border-opacity-30 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
      </div>
    </div>
  )
}
