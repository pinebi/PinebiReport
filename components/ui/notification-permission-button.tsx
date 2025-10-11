'use client'

import React from 'react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function NotificationPermissionButton() {
  const { permission, requestPermission, isLoading } = usePushNotifications()

  const getButtonText = () => {
    switch (permission) {
      case 'granted': return 'Bildirimler Açık'
      case 'denied': return 'Bildirimler Kapalı'
      default: return 'Bildirim İzni Ver'
    }
  }

  const getButtonStyle = () => {
    if (permission === 'denied') return 'bg-gray-400 cursor-not-allowed'
    return 'bg-blue-500 hover:bg-blue-600'
  }

  const handleClick = async () => {
    if (permission !== 'granted') {
      await requestPermission()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={permission === 'denied' || isLoading}
      className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonStyle()}`}
    >
      {isLoading ? 'Yükleniyor...' : getButtonText()}
    </button>
  )
}













