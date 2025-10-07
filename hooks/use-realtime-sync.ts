'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface RealtimeConfig {
  endpoint: string
  interval?: number
  autoConnect?: boolean
  retryAttempts?: number
  retryDelay?: number
}

interface RealtimeData {
  timestamp: number
  data: any
  type: string
}

interface RealtimeSyncResult {
  isConnected: boolean
  isConnecting: boolean
  lastUpdate: Date | null
  data: RealtimeData | null
  error: string | null
  connect: () => void
  disconnect: () => void
  sendMessage: (message: any) => void
}

export function useRealtimeSync(config: RealtimeConfig): RealtimeSyncResult {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [data, setData] = useState<RealtimeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    endpoint,
    interval = 30000,
    autoConnect = true,
    retryAttempts = 5,
    retryDelay = 1000
  } = config

  const connect = useCallback(() => {
    if (isConnecting || isConnected) return

    setIsConnecting(true)
    setError(null)

    try {
      const ws = new WebSocket(endpoint)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('🔗 WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        setLastUpdate(new Date())
        retryCountRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setData({
            timestamp: Date.now(),
            data: message.data,
            type: message.type || 'data'
          })
          setLastUpdate(new Date())
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        
        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && retryCountRef.current < retryAttempts) {
          retryCountRef.current++
          console.log(`🔄 Attempting to reconnect (${retryCountRef.current}/${retryAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, retryDelay * retryCountRef.current)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setError('Connection error occurred')
        setIsConnecting(false)
      }

    } catch (err) {
      console.error('❌ Failed to create WebSocket:', err)
      setError('Failed to establish connection')
      setIsConnecting(false)
    }
  }, [endpoint, retryAttempts, retryDelay, isConnecting, isConnected])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    retryCountRef.current = 0
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message')
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Periodic data sync when connected
  useEffect(() => {
    if (isConnected && interval > 0) {
      intervalRef.current = setInterval(() => {
        sendMessage({ type: 'ping', timestamp: Date.now() })
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isConnected, interval, sendMessage])

  return {
    isConnected,
    isConnecting,
    lastUpdate,
    data,
    error,
    connect,
    disconnect,
    sendMessage
  }
}

// Real-time dashboard data hook
export function useRealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLive, setIsLive] = useState(false)

  const { isConnected, data, error } = useRealtimeSync({
    endpoint: 'ws://localhost:3001/api/ws/dashboard',
    interval: 10000, // 10 seconds
    autoConnect: true
  })

  useEffect(() => {
    if (data && data.type === 'dashboard-update') {
      setDashboardData(data.data)
      setIsLive(true)
    }
  }, [data])

  return {
    dashboardData,
    isLive,
    isConnected,
    error,
    lastUpdate: data?.timestamp ? new Date(data.timestamp) : null
  }
}

// Real-time notification hook
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { data, isConnected } = useRealtimeSync({
    endpoint: 'ws://localhost:3001/api/ws/notifications',
    autoConnect: true
  })

  useEffect(() => {
    if (data && data.type === 'notification') {
      setNotifications(prev => [data.data, ...prev.slice(0, 9)]) // Keep last 10
      setUnreadCount(prev => prev + 1)
    }
  }, [data])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearAll
  }
}

// Connection status indicator component
export function RealtimeStatus({ 
  isConnected, 
  isConnecting, 
  lastUpdate 
}: { 
  isConnected: boolean
  isConnecting: boolean
  lastUpdate: Date | null
}) {
  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500'
    if (isConnected) return 'bg-green-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (isConnecting) return 'Bağlanıyor...'
    if (isConnected) return 'Canlı Veri'
    return 'Bağlantı Yok'
  }

  const getLastUpdateText = () => {
    if (!lastUpdate) return ''
    
    const now = new Date()
    const diff = now.getTime() - lastUpdate.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s önce`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m önce`
    return lastUpdate.toLocaleTimeString('tr-TR')
  }

  return {
    isConnected,
    isSyncing,
    lastUpdate,
    connectionCount,
    getStatusColor,
    getStatusText,
    getLastUpdateText
  }
}
