'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react'

interface CalendarConnection {
  id: string
  provider: 'google' | 'outlook' | 'apple'
  email: string
  isConnected: boolean
  lastSync?: Date
  syncDirection: 'import' | 'export' | 'bidirectional'
  status: 'active' | 'error' | 'pending'
  errorMessage?: string
}

export function CalendarSync() {
  const [connections, setConnections] = useState<CalendarConnection[]>([
    {
      id: '1',
      provider: 'google',
      email: 'user@gmail.com',
      isConnected: true,
      lastSync: new Date(),
      syncDirection: 'bidirectional',
      status: 'active'
    },
    {
      id: '2',
      provider: 'outlook',
      email: 'user@outlook.com',
      isConnected: false,
      syncDirection: 'import',
      status: 'pending'
    }
  ])

  const [isSyncing, setIsSyncing] = useState(false)

  const handleConnect = async (provider: string) => {
    console.log(`Connecting to ${provider}...`)
    
    // OAuth flow simulation
    alert(`${provider} ile bağlantı kurulacak. OAuth akışı başlatılıyor...`)
    
    // Simulate connection
    setTimeout(() => {
      setConnections(prev =>
        prev.map(conn =>
          conn.provider === provider
            ? { ...conn, isConnected: true, status: 'active' as 'active', lastSync: new Date() }
            : conn
        )
      )
    }, 2000)
  }

  const handleDisconnect = (id: string) => {
    if (confirm('Bağlantıyı kesmek istediğinizden emin misiniz?')) {
      setConnections(prev =>
        prev.map(conn =>
          conn.id === id
            ? { ...conn, isConnected: false, status: 'pending' as 'pending' }
            : conn
        )
      )
    }
  }

  const handleSync = async (id: string) => {
    setIsSyncing(true)
    
    console.log('Syncing calendar:', id)
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setConnections(prev =>
      prev.map(conn =>
        conn.id === id
          ? { ...conn, lastSync: new Date() }
          : conn
      )
    )
    
    setIsSyncing(false)
    alert('Takvim senkronizasyonu tamamlandı!')
  }

  const handleExportICal = () => {
    console.log('Exporting to iCal format...')
    alert('iCalendar (.ics) dosyası indiriliyor...')
    
    // Simulate download
    const element = document.createElement('a')
    const fileContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Pinebi//Calendar//EN\nEND:VCALENDAR'
    const file = new Blob([fileContent], { type: 'text/calendar' })
    element.href = URL.createObjectURL(file)
    element.download = 'calendar.ics'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImportICal = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ics'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        console.log('Importing file:', file.name)
        alert(`${file.name} içe aktarılıyor...`)
      }
    }
    input.click()
  }

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🗓️'
      case 'outlook':
        return '📧'
      case 'apple':
        return '🍎'
      default:
        return '📅'
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google Calendar'
      case 'outlook': return 'Outlook Calendar'
      case 'apple': return 'Apple Calendar'
      default: return provider
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Takvim Entegrasyonu</h2>

      {/* iCalendar Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            iCalendar (.ics) İçe/Dışa Aktarma
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleExportICal} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Takvimi Dışa Aktar
          </Button>
          <Button onClick={handleImportICal} variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Takvim İçe Aktar
          </Button>
        </CardContent>
      </Card>

      {/* Calendar Connections */}
      <div className="space-y-4">
        {connections.map(connection => (
          <Card key={connection.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{getProviderLogo(connection.provider)}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{getProviderName(connection.provider)}</h3>
                    {connection.isConnected && (
                      <p className="text-sm text-gray-600">{connection.email}</p>
                    )}
                    {connection.lastSync && (
                      <p className="text-xs text-gray-500 mt-1">
                        Son senkronizasyon: {connection.lastSync.toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  {connection.isConnected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Bağlı
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Bağlı Değil
                    </Badge>
                  )}

                  {connection.status === 'error' && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Hata
                    </Badge>
                  )}

                  {/* Sync direction badge */}
                  {connection.isConnected && (
                    <Badge variant="secondary" className="text-xs">
                      {connection.syncDirection === 'import' && '⬇️ İçe Aktar'}
                      {connection.syncDirection === 'export' && '⬆️ Dışa Aktar'}
                      {connection.syncDirection === 'bidirectional' && '⬍⬍ İki Yönlü'}
                    </Badge>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {connection.isConnected ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(connection.id)}
                          disabled={isSyncing}
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(connection.id)}
                        >
                          Bağlantıyı Kes
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(connection.provider)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Bağlan
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {connection.errorMessage && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {connection.errorMessage}
                </div>
              )}

              {connection.isConnected && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-gray-600">Senkronize Etkinlik</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">24</p>
                    <p className="text-xs text-gray-600">İçe Aktarılan</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">18</p>
                    <p className="text-xs text-gray-600">Dışa Aktarılan</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Senkronizasyon Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Otomatik Senkronizasyon</Label>
              <p className="text-sm text-gray-600">Her 15 dakikada bir otomatik senkronize et</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Çakışma Uyarısı</Label>
              <p className="text-sm text-gray-600">Çakışan etkinlikler için bildirim gönder</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Otomatik Kategorizasyon</Label>
              <p className="text-sm text-gray-600">AI ile otomatik kategori ata</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



