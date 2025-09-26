'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface RealtimeData {
  id: string
  timestamp: Date
  value: number
  label: string
  category: string
}

interface RealtimeContextType {
  // Data
  salesData: RealtimeData[]
  customerData: RealtimeData[]
  revenueData: RealtimeData[]
  
  // Connection Status
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  
  // Controls
  startRealtime: () => void
  stopRealtime: () => void
  clearData: () => void
  
  // Settings
  updateInterval: number
  setUpdateInterval: (interval: number) => void
  maxDataPoints: number
  setMaxDataPoints: (points: number) => void
  
  // Statistics
  totalUpdates: number
  lastUpdate: Date | null
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [salesData, setSalesData] = useState<RealtimeData[]>([])
  const [customerData, setCustomerData] = useState<RealtimeData[]>([])
  const [revenueData, setRevenueData] = useState<RealtimeData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [updateInterval, setUpdateInterval] = useState(5000) // 5 seconds
  const [maxDataPoints, setMaxDataPoints] = useState(50)
  const [totalUpdates, setTotalUpdates] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  let intervalId: NodeJS.Timeout | null = null

  const generateRandomData = (category: string, baseValue: number): RealtimeData => {
    const now = new Date()
    const variation = (Math.random() - 0.5) * baseValue * 0.3 // ±15% variation
    const value = Math.max(0, baseValue + variation)
    
    return {
      id: `${category}-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      value: Math.round(value * 100) / 100,
      label: now.toLocaleTimeString('tr-TR'),
      category
    }
  }

  const updateData = async () => {
    try {
      // Generate new data points
      const newSalesData = generateRandomData('sales', 1500)
      const newCustomerData = generateRandomData('customers', 25)
      const newRevenueData = generateRandomData('revenue', 50000)

      // Update state with new data
      setSalesData(prev => {
        const updated = [...prev, newSalesData]
        return updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated
      })

      setCustomerData(prev => {
        const updated = [...prev, newCustomerData]
        return updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated
      })

      setRevenueData(prev => {
        const updated = [...prev, newRevenueData]
        return updated.length > maxDataPoints ? updated.slice(-maxDataPoints) : updated
      })

      setTotalUpdates(prev => prev + 1)
      setLastUpdate(new Date())

    } catch (error) {
      console.error('Error updating realtime data:', error)
      setConnectionStatus('error')
    }
  }

  const startRealtime = () => {
    if (intervalId) return // Already running

    setConnectionStatus('connecting')
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setConnectionStatus('connected')
      
      intervalId = setInterval(updateData, updateInterval)
    }, 1000)
  }

  const stopRealtime = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }

  const clearData = () => {
    setSalesData([])
    setCustomerData([])
    setRevenueData([])
    setTotalUpdates(0)
    setLastUpdate(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  // Restart interval when updateInterval changes
  useEffect(() => {
    if (isConnected && intervalId) {
      stopRealtime()
      startRealtime()
    }
  }, [updateInterval])

  return (
    <RealtimeContext.Provider value={{
      salesData,
      customerData,
      revenueData,
      isConnected,
      connectionStatus,
      startRealtime,
      stopRealtime,
      clearData,
      updateInterval,
      setUpdateInterval,
      maxDataPoints,
      setMaxDataPoints,
      totalUpdates,
      lastUpdate
    }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}




