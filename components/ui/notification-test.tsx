'use client'

import React from 'react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function NotificationTest() {
  const { showNotification, sendPushNotification } = usePushNotifications()

  const testLocalNotification = () => {
    showNotification({
      title: 'Test Bildirimi',
      body: 'Bu bir test bildirimidir.',
      data: { url: '/' },
      requireInteraction: false
    })
  }

  const testPushNotification = async () => {
    await sendPushNotification({
      title: 'Push Test',
      body: 'Bu bir push bildirim testidir.',
      data: { url: '/' }
    })
  }

  return (
    <div className="space-y-2">
      <button
        onClick={testLocalNotification}
        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Yerel Bildirim Test Et
      </button>
      <button
        onClick={testPushNotification}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
      >
        Push Bildirim Test Et
      </button>
    </div>
  )
}






