'use client'

import { useEffect, useCallback } from 'react'

interface AccessibilityOptions {
  announceChanges?: boolean
  skipLinks?: boolean
  focusManagement?: boolean
  keyboardNavigation?: boolean
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    announceChanges = true,
    skipLinks = true,
    focusManagement = true,
    keyboardNavigation = true
  } = options

  // Announce changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [announceChanges])

  // Focus management
  const trapFocus = useCallback((element: HTMLElement) => {
    if (!focusManagement) return

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }, [focusManagement])

  // Skip links setup
  useEffect(() => {
    if (!skipLinks) return

    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Ana içeriğe geç'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'

    // Insert at the beginning of body
    document.body.insertBefore(skipLink, document.body.firstChild)

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [skipLinks])

  // Keyboard navigation helpers
  const handleKeyDown = useCallback((event: KeyboardEvent, handlers: Record<string, () => void>) => {
    if (!keyboardNavigation) return

    const handler = handlers[event.key]
    if (handler) {
      handler()
      event.preventDefault()
    }
  }, [keyboardNavigation])

  // High contrast mode detection
  const prefersHighContrast = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches
  }, [])

  // Reduced motion detection
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Screen reader detection (basic)
  const isScreenReaderActive = useCallback(() => {
    return window.navigator.userAgent.includes('NVDA') || 
           window.navigator.userAgent.includes('JAWS') ||
           window.navigator.userAgent.includes('VoiceOver')
  }, [])

  return {
    announce,
    trapFocus,
    handleKeyDown,
    prefersHighContrast,
    prefersReducedMotion,
    isScreenReaderActive
  }
}