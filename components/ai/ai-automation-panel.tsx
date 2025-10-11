'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bot, 
  Send, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  Lightbulb,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Recommendation {
  type: string
  title: string
  description: string
  reports: any[]
  priority: string
}

interface Anomaly {
  type: string
  severity: string
  title: string
  description: string
  recommendation: string
  impact: string
  detectedAt: string
}

interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: string
  context: string
  hasData: boolean
}

export function AIAutomationPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'chat' | 'recommendations' | 'anomalies' | 'backup'>('chat')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [backups, setBackups] = useState<any[]>([])

  // Akıllı önerileri yükle
  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/smart-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          companyId: user?.companyId,
          userRole: user?.role
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Recommendations load error:', error)
    }
  }

  // Anomali tespiti yap
  const checkAnomalies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/anomaly-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          companyId: user?.companyId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setAnomalies(data.anomalies)
      }
    } catch (error) {
      console.error('Anomaly check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Backup listesini yükle
  const loadBackups = async () => {
    try {
      const response = await fetch(`/api/ai/auto-backup?userId=${user?.id}&companyId=${user?.companyId}`)
      const data = await response.json()
      if (data.success) {
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Backups load error:', error)
    }
  }

  // Chat mesajı gönder
  const sendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    const userMessage = message
    setMessage('')

    try {
      const response = await fetch('/api/ai/enhanced-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          companyId: user?.companyId,
          context: 'general'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          message: userMessage,
          response: data.response,
          timestamp: data.timestamp,
          context: data.context,
          hasData: data.hasData
        }
        setChatHistory(prev => [...prev, newMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Otomatik backup oluştur
  const createBackup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/auto-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          companyId: user?.companyId,
          backupType: 'full'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        await loadBackups() // Listeyi yenile
        alert(`Backup oluşturuldu: ${data.backup.fileName}`)
      }
    } catch (error) {
      console.error('Backup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'recommendations') {
      loadRecommendations()
    } else if (activeTab === 'anomalies') {
      checkAnomalies()
    } else if (activeTab === 'backup') {
      loadBackups()
    }
  }, [activeTab])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-purple-100 text-purple-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          AI & Otomasyon Merkezi
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('chat')}
          >
            <Bot className="h-4 w-4 mr-2" />
            Chatbot
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('recommendations')}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Öneriler
          </Button>
          <Button
            variant={activeTab === 'anomalies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('anomalies')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Anomali
          </Button>
          <Button
            variant={activeTab === 'backup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('backup')}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <ScrollArea className="h-96 border rounded-lg p-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>AI asistanına bir soru sorun!</p>
                  <p className="text-sm mt-2">Örnek: "Bugünkü satışlar nasıl?"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-900">{msg.message}</p>
                        <p className="text-xs text-blue-600">{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Bot className="h-4 w-4 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-gray-800">{msg.response}</div>
                            {msg.hasData && (
                              <Badge variant="secondary" className="mt-2">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Veri Analizi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="AI asistanına soru sorun..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !message.trim()}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Akıllı Rapor Önerileri</h3>
              <Button onClick={loadRecommendations} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Öneriler yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{rec.description}</p>
                      {rec.reports && rec.reports.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Önerilen Raporlar:</p>
                          {rec.reports.map((report, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span>{report.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Anomali Tespiti</h3>
              <Button onClick={checkAnomalies} disabled={isLoading} size="sm">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Kontrol Et
              </Button>
            </div>
            
            {anomalies.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Herhangi bir anomali tespit edilmedi</p>
                <p className="text-sm mt-2">Sistem normal çalışıyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-red-800">{anomaly.title}</h4>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{anomaly.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">💡 Öneri:</p>
                        <p className="text-sm text-blue-700">{anomaly.recommendation}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>Etki: {anomaly.impact}</span>
                        <span>{new Date(anomaly.detectedAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Otomatik Yedekleme</h3>
              <Button onClick={createBackup} disabled={isLoading} size="sm">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Backup Oluştur
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Son Backup'lar</h4>
                  <ScrollArea className="h-48">
                    {backups.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Henüz backup yok</p>
                    ) : (
                      <div className="space-y-2">
                        {backups.slice(0, 5).map((backup, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{backup.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {(backup.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(backup.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Backup Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Toplam Backup:</span>
                      <span className="font-medium">{backups.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Son Backup:</span>
                      <span className="font-medium">
                        {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString() : 'Yok'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam Boyut:</span>
                      <span className="font-medium">
                        {(backups.reduce((sum, b) => sum + b.fileSize, 0) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">Backup İçeriği:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Rapor konfigürasyonları</li>
                      <li>Kullanıcı ayarları</li>
                      <li>Şirket bilgileri</li>
                      <li>Rapor geçmişi (son 30 gün)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


