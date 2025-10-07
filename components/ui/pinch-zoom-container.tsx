'use client'

import { useState } from 'react'
import { useTouchGestures } from '@/hooks/use-touch-gestures'

interface PinchZoomContainerProps {
  children: React.ReactNode
  onZoom?: (scale: number) => void
  className?: string
}

export function PinchZoomContainer({ 
  children, 
  onZoom,
  className = ''
}: PinchZoomContainerProps) {
  const [scale, setScale] = useState(1)
  const [isZooming, setIsZooming] = useState(false)

  useTouchGestures({
    onPinch: (pinchScale, center) => {
      const newScale = Math.max(0.5, Math.min(3, scale * pinchScale))
      setScale(newScale)
      setIsZooming(true)
      if (onZoom) onZoom(newScale)
    }
  }, {
    pinchThreshold: 0.05,
    preventDefault: true
  })

  return (
    <div 
      className={`${className} transition-transform duration-200 ${isZooming ? 'select-none' : ''}`}
      style={{ transform: `scale(${scale})` }}
    >
      {children}
    </div>
  )
}






