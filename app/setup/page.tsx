'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Database, Play } from 'lucide-react'

export default function SetupPage() {
  const [status, setStatus] = useState<{
    connected: boolean | null
    initialized: boolean | null
    loading: boolean
    error: string | null
  }>({
    connected: null,
    initialized: null,
    loading: false,
    error: null
  })

  const testDatabase = async () => {
    setStatus({ ...status, loading: true, error: null })
    
    try {
      const response = await fetch('/api/init-db')
      const data = await response.json()
      
      if (response.ok) {
        setStatus({
          connected: data.connected,
          initialized: data.initialized,
          loading: false,
          error: null
        })
      } else {
        setStatus({
          connected: false,
          initialized: false,
          loading: false,
          error: data.error || 'Bilinmeyen hata'
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        initialized: false,
        loading: false,
        error: 'Bağlantı hatası'
      })
    }
  }

  const StatusIcon = ({ value }: { value: boolean | null }) => {
    if (value === null) return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    if (value === true) return <CheckCircle className="w-5 h-5 text-green-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">ERP Raporlama Sistemi Kurulumu</CardTitle>
          <p className="text-gray-600 mt-2">Veritabanı bağlantısını test edin ve sistemi başlatın</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Veritabanı Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sunucu:</span>
                <span className="font-mono">185.210.92.248:1433</span>
              </div>
              <div className="flex justify-between">
                <span>Veritabanı:</span>
                <span className="font-mono">PinebiWebReport</span>
              </div>
              <div className="flex justify-between">
                <span>Kullanıcı:</span>
                <span className="font-mono">EDonusum</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <StatusIcon value={status.connected} />
                <span className="font-medium">Veritabanı Bağlantısı</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.connected === null ? 'Test edilmedi' : 
                 status.connected ? 'Başarılı' : 'Başarısız'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <StatusIcon value={status.initialized} />
                <span className="font-medium">Veritabanı Başlatma</span>
              </div>
              <span className="text-sm text-gray-600">
                {status.initialized === null ? 'Test edilmedi' : 
                 status.initialized ? 'Başarılı' : 'Başarısız'}
              </span>
            </div>
          </div>

          {status.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Hata:</span>
              </div>
              <p className="text-red-600 mt-1 text-sm">{status.error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={testDatabase} 
              disabled={status.loading}
              className="flex-1"
            >
              {status.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test Ediliyor...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Veritabanını Test Et
                </>
              )}
            </Button>

            {status.connected && status.initialized && (
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="default"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Sistemi Başlat
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Sistem başarıyla kurulduktan sonra giriş sayfasına yönlendirileceksiniz.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


