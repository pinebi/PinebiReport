'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotificationPermission {
  permission: NotificationPermission
  supported: boolean
}

interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  data?: any
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface UseNotificationsReturn {
  permission: NotificationPermission
  requestPermission: () => Promise<NotificationPermission>
  showNotification: (options: NotificationOptions) => Promise<void>
  closeNotification: (tag?: string) => void
  closeAllNotifications: () => void
  isSupported: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>({
    permission: 'default',
    supported: false
  })

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window
    setPermission({
      permission: supported ? Notification.permission : 'denied',
      supported
    })
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!permission.supported) {
      console.warn('Notifications are not supported in this browser')
      return permission
    }

    try {
      const result = await Notification.requestPermission()
      const newPermission = {
        permission: result,
        supported: true
      }
      setPermission(newPermission)
      return newPermission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return permission
    }
  }, [permission])

  const showNotification = useCallback(async (options: NotificationOptions): Promise<void> => {
    if (!permission.supported) {
      console.warn('Notifications are not supported in this browser')
      return
    }

    if (permission.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: options.timestamp || Date.now(),
        data: options.data,
        actions: options.actions
      })

      // Auto close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return Promise.resolve()
    } catch (error) {
      console.error('Error showing notification:', error)
      return Promise.reject(error)
    }
  }, [permission])

  const closeNotification = useCallback((tag?: string): void => {
    if (!permission.supported) return

    // Close notifications by tag
    if (tag) {
      // Note: There's no direct API to close notifications by tag
      // This would require maintaining a reference to the notification
      console.log(`Requesting to close notification with tag: ${tag}`)
    }
  }, [permission])

  const closeAllNotifications = useCallback((): void => {
    if (!permission.supported) return
    
    // Note: There's no direct API to close all notifications
    // This would require maintaining references to all notifications
    console.log('Requesting to close all notifications')
  }, [permission])

  return {
    permission,
    requestPermission,
    showNotification,
    closeNotification,
    closeAllNotifications,
    isSupported: permission.supported
  }
}




