'use client'

import { useTouchGestures } from '@/hooks/use-touch-gestures'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  className = ''
}: SwipeableCardProps) {
  const { isTouchDevice } = useTouchGestures({
    onSwipeLeft,
    onSwipeRight
  }, {
    swipeThreshold: 100,
    preventDefault: false
  })

  return (
    <div className={`${className} ${isTouchDevice ? 'touch-manipulation' : ''}`}>
      {children}
    </div>
  )
}






