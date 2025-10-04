'use client'

import React, { useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationPanelProps {
  className?: string
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950'
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return 'Şimdi'
    } else if (minutes < 60) {
      return `${minutes} dakika önce`
    } else if (hours < 24) {
      return `${hours} saat önce`
    } else {
      return `${days} gün önce`
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <Card className="absolute right-0 top-12 w-96 max-h-[80vh] z-50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Bildirimler
                  {unreadCount > 0 && (
                    <Badge variant="secondary">
                      {unreadCount} okunmamış
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="h-8 w-8 p-0"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 text-sm">Henüz bildirim yok</p>
                    <p className="text-gray-400 text-xs">Yeni bildirimler burada görünecek</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm",
                          getNotificationColor(notification.type),
                          !notification.read && "ring-1 ring-blue-200 dark:ring-blue-800"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "text-sm font-medium",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNotification(notification.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              
                              {notification.action && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={notification.action.onClick}
                                  className="h-6 px-2 text-xs"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}







