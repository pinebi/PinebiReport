// Gerçek Zamanlı Veri Senkronizasyonu
export interface RealtimeEvent {
  id: string
  type: 'data_update' | 'new_sale' | 'alert' | 'system_status'
  timestamp: Date
  data: any
  source: string
}

export interface DataSubscription {
  id: string
  endpoint: string
  filters?: Record<string, any>
  callback: (data: any) => void
  isActive: boolean
  lastUpdate?: Date
  errorCount: number
}

export interface RealtimeConfig {
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  dataRefreshInterval: number
}

export class RealtimeDataSync {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, DataSubscription> = new Map()
  private config: RealtimeConfig
  private reconnectAttempts = 0
  private heartbeatTimer: NodeJS.Timeout | null = null
  private refreshTimer: NodeJS.Timeout | null = null
  private eventListeners: Map<string, ((event: RealtimeEvent) => void)[]> = new Map()

  constructor(config: Partial<RealtimeConfig> = {}) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      dataRefreshInterval: 60000,
      ...config
    }
  }

  // WebSocket bağlantısı başlat
  async connect(): Promise<boolean> {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.startDataRefresh()
        this.emit('connection', { status: 'connected' })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('WebSocket mesaj parse hatası:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket bağlantısı kapatıldı')
        this.stopHeartbeat()
        this.stopDataRefresh()
        this.emit('connection', { status: 'disconnected' })
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket hatası:', error)
        this.emit('error', { error })
      }

      return true
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error)
      return false
    }
  }

  // Mesaj işle
  private handleMessage(data: any) {
    if (data.type === 'data_update') {
      this.handleDataUpdate(data)
    } else if (data.type === 'new_sale') {
      this.handleNewSale(data)
    } else if (data.type === 'alert') {
      this.handleAlert(data)
    } else if (data.type === 'system_status') {
      this.handleSystemStatus(data)
    }
  }

  // Veri güncelleme işle
  private handleDataUpdate(data: any) {
    this.subscriptions.forEach((subscription, id) => {
      if (subscription.isActive && this.matchesFilter(data.payload, subscription.filters)) {
        subscription.callback(data.payload)
        subscription.lastUpdate = new Date()
        subscription.errorCount = 0
      }
    })

    this.emit('data_update', data)
  }

  // Yeni satış işle
  private handleNewSale(data: any) {
    console.log('Yeni satış:', data.payload)
    this.emit('new_sale', data)
    
    // Tüm satış aboneliklerini güncelle
    this.subscriptions.forEach((subscription) => {
      if (subscription.endpoint.includes('sales') && subscription.isActive) {
        subscription.callback(data.payload)
      }
    })
  }

  // Uyarı işle
  private handleAlert(data: any) {
    console.log('Sistem uyarısı:', data.payload)
    this.emit('alert', data)
  }

  // Sistem durumu işle
  private handleSystemStatus(data: any) {
    console.log('Sistem durumu:', data.payload)
    this.emit('system_status', data)
  }

  // Filtre eşleştirme kontrolü
  private matchesFilter(data: any, filters?: Record<string, any>): boolean {
    if (!filters) return true

    return Object.entries(filters).every(([key, value]) => {
      const dataValue = this.getNestedValue(data, key)
      return dataValue === value
    })
  }

  // Nested object değer al
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Veri aboneliği ekle
  subscribe(
    endpoint: string, 
    callback: (data: any) => void, 
    filters?: Record<string, any>
  ): string {
    const id = this.generateId()
    const subscription: DataSubscription = {
      id,
      endpoint,
      filters,
      callback,
      isActive: true,
      errorCount: 0
    }

    this.subscriptions.set(id, subscription)

    // WebSocket'e abonelik mesajı gönder
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        endpoint,
        filters,
        subscriptionId: id
      }))
    }

    return id
  }

  // Veri aboneliğini kaldır
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) return false

    subscription.isActive = false
    this.subscriptions.delete(subscriptionId)

    // WebSocket'e abonelik iptal mesajı gönder
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscriptionId
      }))
    }

    return true
  }

  // Event listener ekle
  on(eventType: string, callback: (event: RealtimeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(callback)
  }

  // Event listener kaldır
  off(eventType: string, callback: (event: RealtimeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Event emit
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const event: RealtimeEvent = {
        id: this.generateId(),
        type: eventType as any,
        timestamp: new Date(),
        data,
        source: 'realtime-sync'
      }
      
      listeners.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Event listener hatası:', error)
        }
      })
    }
  }

  // Yeniden bağlanma işle
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connect()
      }, this.config.reconnectInterval)
    } else {
      console.error('Maksimum yeniden bağlanma denemesi aşıldı')
      this.emit('connection_failed', { attempts: this.reconnectAttempts })
    }
  }

  // Heartbeat başlat
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.config.heartbeatInterval)
  }

  // Heartbeat durdur
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // Veri yenileme başlat
  private startDataRefresh(): void {
    this.refreshTimer = setInterval(() => {
      this.refreshAllSubscriptions()
    }, this.config.dataRefreshInterval)
  }

  // Veri yenileme durdur
  private stopDataRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Tüm abonelikleri yenile
  private async refreshAllSubscriptions(): Promise<void> {
    const promises = Array.from(this.subscriptions.values())
      .filter(subscription => subscription.isActive)
      .map(subscription => this.refreshSubscription(subscription))

    await Promise.allSettled(promises)
  }

  // Tek abonelik yenile
  private async refreshSubscription(subscription: DataSubscription): Promise<void> {
    try {
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.filters || {})
      })

      if (response.ok) {
        const data = await response.json()
        subscription.callback(data)
        subscription.lastUpdate = new Date()
        subscription.errorCount = 0
      } else {
        subscription.errorCount++
        console.error(`Abonelik yenileme hatası: ${subscription.endpoint}`)
      }
    } catch (error) {
      subscription.errorCount++
      console.error(`Abonelik yenileme hatası: ${subscription.endpoint}`, error)
    }
  }

  // Manuel veri gönder
  sendData(type: string, data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
      return true
    }
    return false
  }

  // Bağlantı durumu
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'disconnected'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'error'
    }
  }

  // Aktif abonelik sayısı
  getActiveSubscriptionCount(): number {
    return Array.from(this.subscriptions.values()).filter(s => s.isActive).length
  }

  // Bağlantıyı kapat
  disconnect(): void {
    this.stopHeartbeat()
    this.stopDataRefresh()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.subscriptions.clear()
    this.eventListeners.clear()
  }

  // ID oluştur
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

// Singleton instance
export const realtimeSync = new RealtimeDataSync()









