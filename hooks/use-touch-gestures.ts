'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  duration: number
}

interface TouchGestureCallbacks {
  onSwipe?: (gesture: SwipeGesture) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number, center: { x: number, y: number }) => void
  onPan?: (delta: { x: number, y: number }) => void
  onTap?: (point: TouchPoint) => void
  onDoubleTap?: (point: TouchPoint) => void
  onLongPress?: (point: TouchPoint) => void
}

interface TouchGestureOptions {
  swipeThreshold?: number
  swipeVelocityThreshold?: number
  pinchThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  preventDefault?: boolean
}

export function useTouchGestures(
  callbacks: TouchGestureCallbacks,
  options: TouchGestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.3,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventDefault = true
  } = options

  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [touchState, setTouchState] = useState({
    isPressed: false,
    isPinching: false,
    isPanning: false
  })

  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPinchDistanceRef = useRef<number>(0)
  const panStartRef = useRef<TouchPoint | null>(null)

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch
      )
    }

    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)
    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [])

  // Get distance between two touches
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Get center point between two touches
  const getTouchCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }, [])

  // Touch start handler
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault()

    const touch = e.touches[0]
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    touchStartRef.current = touchPoint
    setTouchState(prev => ({ ...prev, isPressed: true }))

    // Handle single touch
    if (e.touches.length === 1) {
      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current && callbacks.onLongPress) {
          callbacks.onLongPress(touchStartRef.current)
        }
      }, longPressDelay)

      // Start pan tracking
      panStartRef.current = touchPoint
    }
    // Handle two finger touch (pinch)
    else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      lastPinchDistanceRef.current = distance
      setTouchState(prev => ({ ...prev, isPinching: true }))
    }
  }, [preventDefault, longPressDelay, callbacks, getTouchDistance])

  // Touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault()

    const touch = e.touches[0]
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    // Clear long press timer if moving
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle single touch pan
    if (e.touches.length === 1 && panStartRef.current) {
      const delta = {
        x: currentPoint.x - panStartRef.current.x,
        y: currentPoint.y - panStartRef.current.y
      }

      if (Math.abs(delta.x) > 5 || Math.abs(delta.y) > 5) {
        setTouchState(prev => ({ ...prev, isPanning: true }))
        if (callbacks.onPan) {
          callbacks.onPan(delta)
        }
      }
    }
    // Handle two finger pinch
    else if (e.touches.length === 2 && touchState.isPinching) {
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const scale = distance / lastPinchDistanceRef.current
      const center = getTouchCenter(e.touches[0], e.touches[1])

      if (Math.abs(scale - 1) > pinchThreshold && callbacks.onPinch) {
        callbacks.onPinch(scale, center)
      }

      lastPinchDistanceRef.current = distance
    }
  }, [preventDefault, touchState.isPinching, callbacks, getTouchDistance, getTouchCenter, pinchThreshold])

  // Touch end handler
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault()

    const touch = e.changedTouches[0]
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    touchEndRef.current = touchPoint

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle swipe detection
    if (touchStartRef.current && touchEndRef.current && !touchState.isPanning) {
      const start = touchStartRef.current
      const end = touchEndRef.current
      const distance = getDistance(start, end)
      const duration = end.timestamp - start.timestamp
      const velocity = distance / duration

      if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
        const angle = getAngle(start, end)
        
        let direction: 'left' | 'right' | 'up' | 'down'
        if (angle > -45 && angle < 45) {
          direction = 'right'
        } else if (angle > 45 && angle < 135) {
          direction = 'down'
        } else if (angle > 135 || angle < -135) {
          direction = 'left'
        } else {
          direction = 'up'
        }

        const gesture: SwipeGesture = {
          direction,
          distance,
          velocity,
          duration
        }

        // Call general swipe callback
        if (callbacks.onSwipe) {
          callbacks.onSwipe(gesture)
        }

        // Call specific direction callbacks
        switch (direction) {
          case 'left':
            if (callbacks.onSwipeLeft) callbacks.onSwipeLeft()
            break
          case 'right':
            if (callbacks.onSwipeRight) callbacks.onSwipeRight()
            break
          case 'up':
            if (callbacks.onSwipeUp) callbacks.onSwipeUp()
            break
          case 'down':
            if (callbacks.onSwipeDown) callbacks.onSwipeDown()
            break
        }
      } else if (distance < 10) {
        // Handle tap
        const now = Date.now()
        const timeSinceLastTap = now - lastTapRef.current

        if (timeSinceLastTap < doubleTapDelay) {
          // Double tap
          if (callbacks.onDoubleTap) {
            callbacks.onDoubleTap(touchPoint)
          }
          lastTapRef.current = 0 // Reset to prevent triple tap
        } else {
          // Single tap
          if (callbacks.onTap) {
            callbacks.onTap(touchPoint)
          }
          lastTapRef.current = now
        }
      }
    }

    // Reset state
    setTouchState({
      isPressed: false,
      isPinching: false,
      isPanning: false
    })
    touchStartRef.current = null
    touchEndRef.current = null
    panStartRef.current = null
  }, [preventDefault, touchState.isPanning, callbacks, getDistance, getAngle, swipeThreshold, swipeVelocityThreshold, doubleTapDelay])

  // Attach event listeners
  useEffect(() => {
    if (!isTouchDevice) return

    const element = document.documentElement

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isTouchDevice, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault])

  return {
    isTouchDevice,
    touchState,
    swipeThreshold,
    swipeVelocityThreshold
  }
}



