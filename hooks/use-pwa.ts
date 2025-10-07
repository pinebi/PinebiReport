'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Check if app is installed and running in standalone mode
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      const isInstalled = window.navigator.standalone || standalone
      
      setIsStandalone(standalone)
      setIsInstalled(isInstalled)
    }

    checkStandalone()
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone)

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone)
    }
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Listen for app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      console.log('PWA was installed')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true)
      })
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('No install prompt available')
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      } else {
        console.log('User dismissed the install prompt')
        return false
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
      return false
    }
  }, [deferredPrompt])

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update()
        })
      })
    }
  }, [])

  const shareApp = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pinebi Report',
          text: 'Gelişmiş raporlama ve analiz sistemi',
          url: window.location.href,
          ...data
        })
        return true
      } catch (error) {
        console.error('Error sharing:', error)
        return false
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        return true
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
      }
    }
  }, [])

  const addToHomeScreen = useCallback(() => {
    // For iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const instruction = document.createElement('div')
      instruction.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; max-width: 300px;">
            <p>Ana ekrana eklemek için:</p>
            <p>1. Paylaş butonuna dokunun</p>
            <p>2. "Ana Ekrana Ekle" seçeneğini seçin</p>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 5px;">Tamam</button>
          </div>
        </div>
      `
      document.body.appendChild(instruction)
      return true
    }
    return false
  }, [])

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOnline,
    updateAvailable,
    installApp,
    updateApp,
    shareApp,
    addToHomeScreen
  }
}