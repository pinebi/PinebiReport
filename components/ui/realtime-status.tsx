'use client'

import React from 'react'

interface RealtimeStatusProps {
  isConnected: boolean
  isSyncing: boolean
  lastUpdate: Date | null
  connectionCount: number
}

export function RealtimeStatus({ 
  isConnected, 
  isSyncing, 
  lastUpdate, 
  connectionCount 
}: RealtimeStatusProps) {
  const getStatusColor = () => {
    if (isConnected) {
      return isSyncing ? 'bg-yellow-500' : 'bg-green-500'
    }
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (isConnected) {
      return isSyncing ? 'Senkronize ediliyor...' : `Bağlı (${connectionCount})`
    }
    return 'Bağlantı kesildi'
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

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
      <span className="text-gray-600">{getStatusText()}</span>
      {lastUpdate && (
        <span className="text-gray-500 text-xs">
          ({getLastUpdateText()})
        </span>
      )}
    </div>
  )
}













