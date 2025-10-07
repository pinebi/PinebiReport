'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Calendar, 
  Mail, 
  Bell, 
  FileText, 
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus,
  Zap,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react'
import { ReportAutomation, ReportSchedule, AutomationRule } from '@/lib/workflow/report-automation'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface WorkflowManagerProps {
  className?: string
}

export function WorkflowManager({ className }: WorkflowManagerProps) {
  const [automation] = useState(new ReportAutomation())
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [activeTab, setActiveTab] = useState<'schedules' | 'rules' | 'logs'>('schedules')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    
    // Mock data - gerçek implementasyonda API'den gelecek
    const mockSchedules: ReportSchedule[] = [
      {
        id: '1',
        name: 'Günlük Satış Raporu',
        reportId: 'report_1',
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@company.com', 'manager@company.com'],
        format: 'pdf',
        isActive: true,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Haftalık Performans Raporu',
        reportId: 'report_2',
        frequency: 'weekly',
        time: '08:00',
        dayOfWeek: 1, // Monday
        recipients: ['ceo@company.com'],
        format: 'excel',
        isActive: true,
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Yüksek Satış Uyarısı',
        condition: {
          field: 'GENEL_TOPLAM',
          operator: 'gt',
          value: 100000
        },
        action: {
          type: 'email',
          config: {
            subject: 'Yüksek Satış Uyarısı',
            recipients: ['alert@company.com']
          }
        },
        isActive: true,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
        triggerCount: 15
      },
      {
        id: '2',
        name: 'Düşük Müşteri Bildirimi',
        condition: {
          field: 'Musteri_Sayisi',
          operator: 'lt',
          value: 10
        },
        action: {
          type: 'notification',
          config: {
            message: 'Müşteri sayısı düşük'
          }
        },
        isActive: true,
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
        triggerCount: 3
      }
    ]

    setSchedules(mockSchedules)
    setRules(mockRules)
    setIsLoading(false)
  }

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ))
  }

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ))
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Günlük'
      case 'weekly': return 'Haftalık'
      case 'monthly': return 'Aylık'
      case 'quarterly': return 'Çeyreklik'
      default: return frequency
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'notification': return <Bell className="h-4 w-4" />
      case 'report': return <FileText className="h-4 w-4" />
      case 'webhook': return <Zap className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            İş Akışı Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'schedules' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('schedules')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Zamanlanmış Raporlar
            </Button>
            <Button
              variant={activeTab === 'rules' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('rules')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Otomasyon Kuralları
            </Button>
            <Button
              variant={activeTab === 'logs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('logs')}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Loglar
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'schedules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Zamanlanmış Raporlar</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Zamanlama
                </Button>
              </div>

              <div className="grid gap-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{schedule.name}</h4>
                          <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                            {schedule.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                          <Badge variant="outline">
                            {getFrequencyLabel(schedule.frequency)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schedule.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {schedule.recipients.length} alıcı
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {schedule.format.toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {schedule.nextRun && formatRelativeTime(schedule.nextRun)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSchedule(schedule.id)}
                        >
                          {schedule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Otomasyon Kuralları</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Kural
                </Button>
              </div>

              <div className="grid gap-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                          <Badge variant="outline">
                            {rule.triggerCount} tetiklenme
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Koşul:</span> {rule.condition.field} {rule.condition.operator} {rule.condition.value}
                          </div>
                          <div className="flex items-center gap-1">
                            {getActionIcon(rule.action.type)}
                            {rule.action.type}
                          </div>
                          <div>
                            <span className="font-medium">Son tetiklenme:</span> {rule.lastTriggered && formatRelativeTime(rule.lastTriggered)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRule(rule.id)}
                        >
                          {rule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">İşlem Logları</h3>
              
              <div className="space-y-2">
                {[
                  { id: 1, type: 'success', message: 'Günlük Satış Raporu başarıyla gönderildi', time: '2 saat önce' },
                  { id: 2, type: 'info', message: 'Yüksek Satış Uyarısı tetiklendi', time: '4 saat önce' },
                  { id: 3, type: 'success', message: 'Haftalık Performans Raporu oluşturuldu', time: '1 gün önce' },
                  { id: 4, type: 'warning', message: 'Düşük Müşteri Bildirimi gönderildi', time: '2 gün önce' }
                ].map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {log.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {log.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    {log.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-gray-500">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}









