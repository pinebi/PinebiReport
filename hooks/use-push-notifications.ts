'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Register service worker and check subscription
  useEffect(() => {
    if (isSupported) {
      registerServiceWorker()
      checkSubscription()
    }
  }, [isSupported])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Failed to check subscription:', error)
    }
  }

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported')
      return false
    }

    setIsLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        await subscribeToPush()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to request permission:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })
      
      setSubscription(sub)
      
      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      })
      
      console.log('Push subscription successful')
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  const showNotification = useCallback((data: NotificationData) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      data: data.data,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: 'pinebi-notification',
      timestamp: data.timestamp || Date.now()
    })

    notification.onclick = () => {
      window.focus()
      if (data.data?.url) {
        window.location.href = data.data.url
      }
      notification.close()
    }

    // Auto close after 5 seconds unless requireInteraction is true
    if (!data.requireInteraction) {
      setTimeout(() => notification.close(), 5000)
    }
  }, [permission])

  const sendPushNotification = useCallback(async (data: NotificationData) => {
    if (!subscription) {
      console.warn('No push subscription available')
      return false
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          data
        }),
      })

      if (response.ok) {
        console.log('Push notification sent successfully')
        return true
      } else {
        console.error('Failed to send push notification')
        return false
      }
    } catch (error) {
      console.error('Error sending push notification:', error)
      return false
    }
  }, [subscription])

  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return false

    try {
      const success = await subscription.unsubscribe()
      if (success) {
        setSubscription(null)
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        })
        
        console.log('Successfully unsubscribed from push notifications')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      return false
    }
  }, [subscription])

  const scheduleNotification = useCallback((data: NotificationData, delay: number) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    setTimeout(() => {
      showNotification(data)
    }, delay)
  }, [permission, showNotification])

  const clearAllNotifications = useCallback(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.showNotification('', { tag: 'pinebi-notification' })
        })
      })
    }
  }, [])

  return {
    permission,
    isSupported,
    isLoading,
    subscription: !!subscription,
    requestPermission,
    showNotification,
    sendPushNotification,
    unsubscribeFromPush,
    scheduleNotification,
    clearAllNotifications
  }
}