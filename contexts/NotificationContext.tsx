'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  
  // Settings
  maxNotifications: number
  autoRemoveDelay: number
  enableSound: boolean
  enableDesktopNotifications: boolean
  
  // Threshold Alerts
  addThresholdAlert: (metric: string, threshold: number, operator: '>' | '<' | '=' | '>=' | '<=') => void
  removeThresholdAlert: (metric: string) => void
  thresholdAlerts: ThresholdAlert[]
}

interface ThresholdAlert {
  metric: string
  threshold: number
  operator: '>' | '<' | '=' | '>=' | '<='
  enabled: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([])
  const [maxNotifications] = useState(50)
  const [autoRemoveDelay] = useState(5000) // 5 seconds
  const [enableSound] = useState(true)
  const [enableDesktopNotifications] = useState(true)

  const unreadCount = notifications.filter(n => !n.read).length

  // Request notification permission
  useEffect(() => {
    if (enableDesktopNotifications && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [enableDesktopNotifications])

  // Auto-remove notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          notification.persistent || 
          Date.now() - notification.timestamp.getTime() < autoRemoveDelay
        )
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRemoveDelay])

  // Play notification sound
  const playNotificationSound = () => {
    if (enableSound) {
      try {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {
          // Fallback: use Web Audio API to generate a simple beep
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = 800
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        })
      } catch (error) {
        console.warn('Could not play notification sound:', error)
      }
    }
  }

  // Show desktop notification
  const showDesktopNotification = (notification: Notification) => {
    if (enableDesktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.persistent
      })

      desktopNotification.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        desktopNotification.close()
      }

      // Auto-close after 5 seconds unless persistent
      if (!notification.persistent) {
        setTimeout(() => {
          desktopNotification.close()
        }, 5000)
      }
    }
  }

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications)
      return updated
    })

    playNotificationSound()
    showDesktopNotification(notification)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const addThresholdAlert = (metric: string, threshold: number, operator: '>' | '<' | '=' | '>=' | '<=') => {
    setThresholdAlerts(prev => {
      const existing = prev.find(alert => alert.metric === metric)
      if (existing) {
        return prev.map(alert => 
          alert.metric === metric 
            ? { ...alert, threshold, operator, enabled: true }
            : alert
        )
      } else {
        return [...prev, { metric, threshold, operator, enabled: true }]
      }
    })
  }

  const removeThresholdAlert = (metric: string) => {
    setThresholdAlerts(prev => prev.filter(alert => alert.metric !== metric))
  }

  // Monitor threshold alerts (this would typically be connected to real data)
  useEffect(() => {
    const checkThresholds = () => {
      thresholdAlerts.forEach(alert => {
        if (!alert.enabled) return

        // Mock data - in real implementation, this would check actual metric values
        const mockValue = Math.random() * 100
        
        let shouldAlert = false
        switch (alert.operator) {
          case '>':
            shouldAlert = mockValue > alert.threshold
            break
          case '<':
            shouldAlert = mockValue < alert.threshold
            break
          case '=':
            shouldAlert = mockValue === alert.threshold
            break
          case '>=':
            shouldAlert = mockValue >= alert.threshold
            break
          case '<=':
            shouldAlert = mockValue <= alert.threshold
            break
        }

        if (shouldAlert) {
          addNotification({
            title: 'Eşik Uyarısı',
            message: `${alert.metric} değeri (${mockValue.toFixed(1)}) ${alert.operator} ${alert.threshold} eşiğini aştı`,
            type: 'warning',
            persistent: false
          })
        }
      })
    }

    const interval = setInterval(checkThresholds, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [thresholdAlerts])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      maxNotifications,
      autoRemoveDelay,
      enableSound,
      enableDesktopNotifications,
      addThresholdAlert,
      removeThresholdAlert,
      thresholdAlerts
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}




