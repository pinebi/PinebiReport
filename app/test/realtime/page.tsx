'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Wifi, 
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Database,
  Zap,
  Clock,
  Users
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { realtimeSync, RealtimeEvent } from '@/lib/realtime/data-sync'

export default function RealtimeTestPage() {
  const { success, error, warning, info } = useToast()
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected')
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0)
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [subscriptions, setSubscriptions] = useState<string[]>([])

  useEffect(() => {
    setupRealtimeSync()
    
    return () => {
      realtimeSync.disconnect()
    }
  }, [])

  const setupRealtimeSync = () => {
    // Connection status listener
    realtimeSync.on('connection', (event) => {
      setConnectionStatus(event.data.status)
      setIsConnected(event.data.status === 'connected')
      
      if (event.data.status === 'connected') {
        success('Real-time Bağlantısı', 'WebSocket bağlantısı kuruldu')
      } else if (event.data.status === 'disconnected') {
        warning('Bağlantı Kesildi', 'WebSocket bağlantısı koptu')
      }
    })

    // Data update listener
    realtimeSync.on('data_update', (event) => {
      addEvent(event)
      success('Veri Güncellemesi', 'Yeni veri alındı')
    })

    // New sale listener
    realtimeSync.on('new_sale', (event) => {
      addEvent(event)
      info('Yeni Satış', 'Yeni satış kaydı alındı')
    })

    // Alert listener
    realtimeSync.on('alert', (event) => {
      addEvent(event)
      warning('Sistem Uyarısı', 'Sistem uyarısı alındı')
    })

    // System status listener
    realtimeSync.on('system_status', (event) => {
      addEvent(event)
      info('Sistem Durumu', 'Sistem durumu güncellendi')
    })

    // Error listener
    realtimeSync.on('error', (event) => {
      addEvent(event)
      error('Real-time Hatası', event.data.error?.message || 'Bilinmeyen hata')
    })

    // Connection failed listener
    realtimeSync.on('connection_failed', (event) => {
      addEvent(event)
      error('Bağlantı Hatası', `Maksimum deneme sayısı aşıldı: ${event.data.attempts}`)
    })

    updateStatus()
  }

  const addEvent = (event: RealtimeEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 19)]) // Keep last 20 events
  }

  const updateStatus = () => {
    setConnectionStatus(realtimeSync.getConnectionStatus())
    setSubscriptionCount(realtimeSync.getActiveSubscriptionCount())
  }

  const connectRealtime = async () => {
    try {
      const connected = await realtimeSync.connect()
      if (connected) {
        success('Bağlantı Başarılı', 'Real-time bağlantısı kuruldu')
      } else {
        error('Bağlantı Hatası', 'Real-time bağlantısı kurulamadı')
      }
      updateStatus()
    } catch (err) {
      error('Bağlantı Hatası', String(err))
    }
  }

  const disconnectRealtime = () => {
    realtimeSync.disconnect()
    setEvents([])
    setSubscriptions([])
    updateStatus()
    warning('Bağlantı Kesildi', 'Real-time bağlantısı kapatıldı')
  }

  const addTestSubscription = () => {
    const subscriptionId = realtimeSync.subscribe(
      '/api/test-endpoint',
      (data) => {
        console.log('Test subscription data:', data)
        addEvent({
          id: Math.random().toString(36).substr(2, 9),
          type: 'data_update',
          timestamp: new Date(),
          data: data,
          source: 'test-subscription'
        })
      },
      { type: 'test' }
    )
    
    setSubscriptions(prev => [...prev, subscriptionId])
    updateStatus()
    success('Abonelik Eklendi', `Test aboneliği eklendi: ${subscriptionId}`)
  }

  const removeSubscription = (subscriptionId: string) => {
    realtimeSync.unsubscribe(subscriptionId)
    setSubscriptions(prev => prev.filter(id => id !== subscriptionId))
    updateStatus()
    success('Abonelik Kaldırıldı', `Abonelik kaldırıldı: ${subscriptionId}`)
  }

  const sendTestData = () => {
    const testData = {
      message: 'Test mesajı',
      timestamp: new Date().toISOString(),
      data: {
        id: Math.random().toString(36).substr(2, 9),
        value: Math.floor(Math.random() * 1000)
      }
    }
    
    const sent = realtimeSync.sendData('test_message', testData)
    if (sent) {
      success('Veri Gönderildi', 'Test verisi başarıyla gönderildi')
    } else {
      error('Gönderim Hatası', 'Test verisi gönderilemedi')
    }
  }

  const simulateNewSale = () => {
    const saleData = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Math.floor(Math.random() * 10000) + 100,
      customer: 'Test Müşteri',
      timestamp: new Date().toISOString()
    }
    
    const sent = realtimeSync.sendData('new_sale', saleData)
    if (sent) {
      success('Satış Simülasyonu', 'Yeni satış verisi gönderildi')
    } else {
      error('Simülasyon Hatası', 'Satış verisi gönderilemedi')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-blue-600'
      case 'disconnected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'data_update': return <Database className="h-4 w-4 text-blue-600" />
      case 'new_sale': return <Zap className="h-4 w-4 text-green-600" />
      case 'alert': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'system_status': return <Activity className="h-4 w-4 text-purple-600" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Real-time Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerçek zamanlı veri senkronizasyonu ve WebSocket bağlantılarını test edin
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-2 ${getStatusColor(connectionStatus)}`}
          >
            {getStatusIcon(connectionStatus)}
            {connectionStatus}
          </Badge>
          
          <div className="flex gap-2">
            {!isConnected ? (
              <Button onClick={connectRealtime} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Bağlan
              </Button>
            ) : (
              <Button onClick={disconnectRealtime} variant="destructive" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Bağlantıyı Kes
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Bağlantı Kontrolleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {connectionStatus}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Bağlantı Durumu
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {subscriptionCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Aktif Abonelik
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {events.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam Event
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Aksiyonları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={addTestSubscription}
              disabled={!isConnected}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Bell className="h-6 w-6" />
              <span className="text-sm">Abonelik Ekle</span>
            </Button>
            
            <Button
              onClick={sendTestData}
              disabled={!isConnected}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">Test Veri</span>
            </Button>
            
            <Button
              onClick={simulateNewSale}
              disabled={!isConnected}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm">Satış Simüle</span>
            </Button>
            
            <Button
              onClick={updateStatus}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <RefreshCw className="h-6 w-6" />
              <span className="text-sm">Durum Güncelle</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Aktif Abonelikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriptions.map((subscriptionId) => (
                <div key={subscriptionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{subscriptionId}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        /api/test-endpoint
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubscription(subscriptionId)}
                  >
                    Kaldır
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz event yok. Bağlantı kurup test verileri gönderin.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{event.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.source}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {event.timestamp.toLocaleTimeString('tr-TR')}
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono text-xs overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performans İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {events.filter(e => e.type === 'data_update').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Veri Güncellemesi
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.type === 'new_sale').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Yeni Satış
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {events.filter(e => e.type === 'alert').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uyarı
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {events.filter(e => (e as any).type === 'error').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hata
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
