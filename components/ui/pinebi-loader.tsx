'use client'

import React from 'react'

interface PinebiLoaderProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
  variant?: 'default' | 'modern' | 'minimal' | 'pulse'
}

export default function PinebiLoader({ 
  size = 'medium', 
  text = 'Yükleniyor...', 
  fullScreen = false,
  variant = 'modern'
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
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 z-50'
    : 'flex flex-col items-center justify-center p-4'

  // Render different variants
  if (variant === 'minimal') {
    return (
      <div className={containerClasses}>
        <div className={`${sizeClasses[size]} relative mb-4`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#A7F300] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClasses}>
        <div className={`${sizeClasses[size]} relative mb-4`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#A7F300] rounded-full animate-ping"></div>
            <div className="absolute w-8 h-8 bg-[#A7F300] rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </div>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      {/* Enhanced Pinebi Logo Animation */}
      <div className={`${sizeClasses[size]} relative mb-4`}>
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A7F300] to-[#00568C] rounded-full opacity-10 blur-xl animate-pulse"></div>
        
        {/* Main Logo Elements */}
        <div className="absolute inset-0">
          {/* Sol dikey bar - Enhanced */}
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30"></div>
          
          {/* Orta yatay bar - Enhanced */}
          <div className="absolute left-1 top-2 w-3 h-1 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-bounce shadow-lg shadow-[#A7F300]/30"></div>
          
          {/* Üst dikey bar - Enhanced */}
          <div className="absolute left-1 top-0 w-1 h-2 bg-gradient-to-b from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.2s'}}></div>
          
          {/* Sağ üçgen - Enhanced */}
          <div className="absolute left-4 top-1">
            <div className="w-0 h-0 border-l-[6px] border-l-[#A7F300] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent animate-spin shadow-lg shadow-[#A7F300]/30" style={{animationDuration: '2s'}}></div>
          </div>
          
          {/* Sağ yatay bar - Enhanced */}
          <div className="absolute left-6 top-2 w-4 h-1 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Enhanced Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 w-1 h-full bg-[#A7F300] rounded-full opacity-40 blur-md animate-pulse"></div>
          <div className="absolute left-1 top-2 w-3 h-1 bg-[#A7F300] rounded-full opacity-40 blur-md animate-bounce"></div>
          <div className="absolute left-1 top-0 w-1 h-2 bg-[#A7F300] rounded-full opacity-40 blur-md animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute left-6 top-2 w-4 h-1 bg-[#A7F300] rounded-full opacity-40 blur-md animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Enhanced Rotating Rings */}
        <div className="absolute inset-0 border-2 border-[#A7F300] border-opacity-30 rounded-full animate-spin shadow-lg shadow-[#A7F300]/20" style={{animationDuration: '3s'}}></div>
        <div className="absolute inset-1 border border-[#00568C] border-opacity-40 rounded-full animate-spin shadow-lg shadow-[#00568C]/20" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
        <div className="absolute inset-2 border border-[#A7F300] border-opacity-20 rounded-full animate-spin shadow-lg shadow-[#A7F300]/10" style={{animationDuration: '1.5s'}}></div>
      </div>

      {/* Enhanced Pinebi Text */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-[#00568C] font-bold text-xl animate-pulse">Pinebi</span>
        </div>
        <div className="text-[#00568C] text-xs font-medium mb-3 animate-fade-in">SOFTWARE SOLUTIONS</div>
        
        {/* Enhanced Loading Text */}
        <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium mb-4 animate-pulse`}>
          {text}
        </div>

        {/* Enhanced Progress Dots */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-bounce shadow-lg shadow-[#A7F300]/30"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-bounce shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-bounce shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-[#A7F300] via-[#90E000] to-[#00568C] rounded-full shadow-lg shadow-[#A7F300]/30" style={{
          animation: 'loading-bar 2s ease-in-out infinite'
        }}></div>
      </div>

      {/* Additional Progress Indicator */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
        <span className="inline-block animate-pulse">●</span>
        <span className="inline-block animate-pulse ml-1" style={{animationDelay: '0.5s'}}>●</span>
        <span className="inline-block animate-pulse ml-1" style={{animationDelay: '1s'}}>●</span>
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
        
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 5px rgba(167, 243, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(167, 243, 0, 0.6);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-in-out;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Enhanced Compact version for smaller spaces
export function PinebiLoaderCompact({ 
  size = 'small',
  variant = 'default'
}: { 
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'minimal' | 'pulse'
}) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#A7F300] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#A7F300] rounded-full animate-ping"></div>
            <div className="absolute w-4 h-4 bg-[#A7F300] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#A7F300] to-[#00568C] rounded-full opacity-10 blur-lg animate-pulse"></div>
        
        {/* Enhanced Logo Elements */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30"></div>
          <div className="absolute left-0.5 top-1 w-2 h-0.5 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-bounce shadow-lg shadow-[#A7F300]/30"></div>
          <div className="absolute left-0.5 top-0 w-0.5 h-1 bg-gradient-to-b from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute left-3 top-0.5">
            <div className="w-0 h-0 border-l-[4px] border-l-[#A7F300] border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent animate-spin shadow-lg shadow-[#A7F300]/30" style={{animationDuration: '2s'}}></div>
          </div>
          <div className="absolute left-4 top-1 w-3 h-0.5 bg-gradient-to-r from-[#A7F300] to-[#90E000] rounded-full animate-pulse shadow-lg shadow-[#A7F300]/30" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Enhanced Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 w-0.5 h-full bg-[#A7F300] rounded-full opacity-40 blur-sm animate-pulse"></div>
          <div className="absolute left-0.5 top-1 w-2 h-0.5 bg-[#A7F300] rounded-full opacity-40 blur-sm animate-bounce"></div>
          <div className="absolute left-0.5 top-0 w-0.5 h-1 bg-[#A7F300] rounded-full opacity-40 blur-sm animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute left-4 top-1 w-3 h-0.5 bg-[#A7F300] rounded-full opacity-40 blur-sm animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Enhanced Rotating Rings */}
        <div className="absolute inset-0 border border-[#A7F300] border-opacity-30 rounded-full animate-spin shadow-lg shadow-[#A7F300]/20" style={{animationDuration: '3s'}}></div>
        <div className="absolute inset-1 border border-[#00568C] border-opacity-40 rounded-full animate-spin shadow-lg shadow-[#00568C]/20" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
      </div>
    </div>
  )
}
