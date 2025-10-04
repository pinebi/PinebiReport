'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Clock, 
  Mail, 
  Bell, 
  FileText,
  Play,
  Pause,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { ReportAutomation, ReportSchedule, AutomationRule } from '@/lib/workflow/report-automation'
import { WorkflowManager } from '@/components/workflow/workflow-manager'

export default function WorkflowTestPage() {
  const { success, error, warning, info } = useToast()
  const [automation] = useState(new ReportAutomation())
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    loadTestData()
  }, [])

  const loadTestData = () => {
    // Test schedule'ları ekle
    const testSchedule1 = automation.addSchedule({
      name: 'Günlük Test Raporu',
      reportId: 'test_daily_report',
      frequency: 'daily',
      time: '09:00',
      recipients: ['test@company.com'],
      format: 'pdf',
      isActive: true
    })

    const testSchedule2 = automation.addSchedule({
      name: 'Haftalık Test Raporu',
      reportId: 'test_weekly_report',
      frequency: 'weekly',
      time: '08:00',
      dayOfWeek: 1, // Monday
      recipients: ['manager@company.com'],
      format: 'excel',
      isActive: true
    })

    // Test kuralları ekle
    const testRule1 = automation.addRule({
      name: 'Yüksek Satış Test Uyarısı',
      condition: {
        field: 'GENEL_TOPLAM',
        operator: 'gt',
        value: 50000
      },
      action: {
        type: 'email',
        config: {
          subject: 'Test: Yüksek Satış Uyarısı',
          recipients: ['alert@company.com']
        }
      },
      isActive: true,
      triggerCount: 0
    })

    const testRule2 = automation.addRule({
      name: 'Düşük Müşteri Test Bildirimi',
      condition: {
        field: 'Musteri_Sayisi',
        operator: 'lt',
        value: 5
      },
      action: {
        type: 'notification',
        config: {
          message: 'Test: Müşteri sayısı düşük'
        }
      },
      isActive: true,
      triggerCount: 0
    })

    setSchedules(automation.getAllSchedules())
    setRules(automation.getAllRules())
  }

  const runWorkflowTests = async () => {
    setIsRunning(true)
    const results: any[] = []

    try {
      // Test 1: Schedule Ekleme
      const newSchedule = automation.addSchedule({
        name: 'Test Schedule',
        reportId: 'test_report',
        frequency: 'daily',
        time: '10:00',
        recipients: ['test@example.com'],
        format: 'pdf',
        isActive: true
      })
      results.push({ test: 'Schedule Ekleme', status: 'passed', data: newSchedule })

      // Test 2: Rule Ekleme
      const newRule = automation.addRule({
        name: 'Test Rule',
        condition: {
          field: 'GENEL_TOPLAM',
          operator: 'gt',
          value: 1000
        },
        action: {
          type: 'email',
          config: {
            subject: 'Test Email',
            recipients: ['test@example.com']
          }
        },
        isActive: true,
        triggerCount: 0
      })
      results.push({ test: 'Rule Ekleme', status: 'passed', data: newRule })

      // Test 3: Zamanlanmış Raporları Kontrol Et
      const dueReports = automation.checkScheduledReports()
      results.push({ test: 'Zamanlanmış Raporlar', status: 'passed', data: dueReports })

      // Test 4: Automation Kurallarını Kontrol Et
      const testData = {
        GENEL_TOPLAM: 75000,
        Musteri_Sayisi: 3,
        Firma: 'Test Firma'
      }
      const triggeredRules = automation.checkAutomationRules(testData)
      results.push({ test: 'Kural Tetikleme', status: 'passed', data: triggeredRules })

      setTestResults(results)
      success('Workflow Testleri Başarılı!', `${results.length} test tamamlandı`)

    } catch (err) {
      error('Workflow Test Hatası', String(err))
    } finally {
      setIsRunning(false)
    }
  }

  const testScheduleExecution = async (scheduleId: string) => {
    try {
      const result = await automation.executeReport(scheduleId)
      if (result) {
        success('Rapor Çalıştırıldı', 'Test raporu başarıyla oluşturuldu')
      } else {
        error('Rapor Hatası', 'Test raporu oluşturulamadı')
      }
    } catch (err) {
      error('Rapor Çalıştırma Hatası', String(err))
    }
  }

  const testRuleTrigger = async (ruleId: string) => {
    try {
      const testData = {
        GENEL_TOPLAM: 100000,
        Musteri_Sayisi: 2,
        Firma: 'Test Firma'
      }
      const result = await automation.triggerRule(ruleId, testData)
      if (result) {
        success('Kural Tetiklendi', 'Test kuralı başarıyla çalıştırıldı')
      } else {
        error('Kural Hatası', 'Test kuralı çalıştırılamadı')
      }
    } catch (err) {
      error('Kural Tetikleme Hatası', String(err))
    }
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
      default: return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-blue-600" />
            Workflow Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            İş akışı otomasyonu ve zamanlanmış görevleri test edin
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runWorkflowTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Çalışıyor...' : 'Tümünü Test Et'}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Test Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.status === 'passed' ? 'Başarılı' : 'Başarısız'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                    {result.status === 'passed' ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Zamanlanmış Raporlar Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      {schedule.nextRun && schedule.nextRun.toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testScheduleExecution(schedule.id)}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => automation.updateSchedule(schedule.id, { 
                      isActive: !schedule.isActive 
                    })}
                  >
                    {schedule.isActive ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Otomasyon Kuralları Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <span className="font-medium">Son tetiklenme:</span> {rule.lastTriggered && rule.lastTriggered.toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testRuleTrigger(rule.id)}
                  >
                    <Zap className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => automation.updateRule(rule.id, { 
                      isActive: !rule.isActive 
                    })}
                  >
                    {rule.isActive ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Manager Demo */}
      <WorkflowManager />

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Sistem Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {schedules.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Zamanlanmış Rapor
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rules.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Otomasyon Kuralı
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {rules.reduce((sum, rule) => sum + rule.triggerCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam Tetiklenme
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
