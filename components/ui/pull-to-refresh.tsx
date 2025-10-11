'use client'

import { useTouchGestures } from '@/hooks/use-touch-gestures'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => void
  className?: string
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  className = '' 
}: PullToRefreshProps) {
  const { isTouchDevice } = useTouchGestures({
    onSwipeUp: onRefresh,
    onSwipeDown: onRefresh
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













