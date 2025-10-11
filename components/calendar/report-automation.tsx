'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Clock, Play, Trash2, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ScheduledReport {
  id: string
  reportId: string
  reportName: string
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    cronExpression?: string
  }
  enabled: boolean
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
  lastRun?: Date
  nextRun?: Date
}

export function ReportAutomation() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      reportId: 'report_1',
      reportName: 'Haftalık Satış Raporu',
      schedule: {
        type: 'weekly',
        time: '09:00',
        dayOfWeek: 1 // Pazartesi
      },
      enabled: true,
      recipients: ['manager@company.com', 'sales@company.com'],
      format: 'excel',
      lastRun: new Date('2025-10-07T09:00:00'),
      nextRun: new Date('2025-10-14T09:00:00')
    },
    {
      id: '2',
      reportId: 'report_2',
      reportName: 'Aylık Ciro Raporu',
      schedule: {
        type: 'monthly',
        time: '08:00',
        dayOfMonth: 1
      },
      enabled: true,
      recipients: ['ceo@company.com', 'finance@company.com'],
      format: 'pdf',
      lastRun: new Date('2025-10-01T08:00:00'),
      nextRun: new Date('2025-11-01T08:00:00')
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newReport, setNewReport] = useState({
    reportName: '',
    scheduleType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: '',
    format: 'excel' as 'pdf' | 'excel' | 'csv'
  })

  const handleToggle = (id: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu zamanlanmış raporu silmek istediğinizden emin misiniz?')) {
      setScheduledReports(prev => prev.filter(report => report.id !== id))
    }
  }

  const handleRunNow = async (id: string) => {
    const report = scheduledReports.find(r => r.id === id)
    if (!report) return

    console.log('Running report:', report.reportName)
    alert(`${report.reportName} raporu çalıştırılıyor...`)
    
    // API call to run report immediately
    try {
      const response = await fetch('/api/reports/scheduled/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledReportId: id })
      })
      
      if (response.ok) {
        alert('Rapor başarıyla çalıştırıldı ve gönderildi!')
      }
    } catch (error) {
      console.error('Error running report:', error)
    }
  }

  const handleAddReport = () => {
    const newScheduledReport: ScheduledReport = {
      id: `scheduled_${Date.now()}`,
      reportId: `report_${Date.now()}`,
      reportName: newReport.reportName,
      schedule: {
        type: newReport.scheduleType,
        time: newReport.time,
        dayOfWeek: newReport.dayOfWeek,
        dayOfMonth: newReport.dayOfMonth
      },
      enabled: true,
      recipients: newReport.recipients.split(',').map(r => r.trim()),
      format: newReport.format,
      nextRun: calculateNextRun(newReport)
    }

    setScheduledReports(prev => [...prev, newScheduledReport])
    setShowAddForm(false)
    setNewReport({
      reportName: '',
      scheduleType: 'daily',
      time: '09:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      recipients: '',
      format: 'excel'
    })
  }

  const calculateNextRun = (report: any): Date => {
    const now = new Date()
    const [hours, minutes] = report.time.split(':').map(Number)
    
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    if (report.scheduleType === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
    } else if (report.scheduleType === 'weekly') {
      const targetDay = report.dayOfWeek
      const currentDay = now.getDay()
      let daysUntilTarget = targetDay - currentDay
      if (daysUntilTarget <= 0) daysUntilTarget += 7
      nextRun.setDate(now.getDate() + daysUntilTarget)
    } else if (report.scheduleType === 'monthly') {
      nextRun.setDate(report.dayOfMonth)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }

    return nextRun
  }

  const getScheduleDescription = (report: ScheduledReport) => {
    const { type, time, dayOfWeek, dayOfMonth } = report.schedule
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

    if (type === 'daily') {
      return `Her gün saat ${time}`
    } else if (type === 'weekly') {
      return `Her ${days[dayOfWeek || 1]} saat ${time}`
    } else if (type === 'monthly') {
      return `Her ayın ${dayOfMonth}. günü saat ${time}`
    }
    return 'Özel zamanlama'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rapor Otomasyonu</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Zamanlama
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Zamanlanmış Rapor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rapor Adı</Label>
              <Input
                value={newReport.reportName}
                onChange={(e) => setNewReport({ ...newReport, reportName: e.target.value })}
                placeholder="Haftalık Satış Raporu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Zamanlama Tipi</Label>
                <Select
                  value={newReport.scheduleType}
                  onValueChange={(value: any) => setNewReport({ ...newReport, scheduleType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Günlük</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                    <SelectItem value="monthly">Aylık</SelectItem>
                    <SelectItem value="custom">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Saat</Label>
                <Input
                  type="time"
                  value={newReport.time}
                  onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                />
              </div>
            </div>

            {newReport.scheduleType === 'weekly' && (
              <div>
                <Label>Hafta Günü</Label>
                <Select
                  value={newReport.dayOfWeek.toString()}
                  onValueChange={(value) => setNewReport({ ...newReport, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pazartesi</SelectItem>
                    <SelectItem value="2">Salı</SelectItem>
                    <SelectItem value="3">Çarşamba</SelectItem>
                    <SelectItem value="4">Perşembe</SelectItem>
                    <SelectItem value="5">Cuma</SelectItem>
                    <SelectItem value="6">Cumartesi</SelectItem>
                    <SelectItem value="0">Pazar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newReport.scheduleType === 'monthly' && (
              <div>
                <Label>Ayın Günü</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={newReport.dayOfMonth}
                  onChange={(e) => setNewReport({ ...newReport, dayOfMonth: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div>
              <Label>Format</Label>
              <Select
                value={newReport.format}
                onValueChange={(value: any) => setNewReport({ ...newReport, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Alıcılar (virgülle ayırın)</Label>
              <Input
                value={newReport.recipients}
                onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                placeholder="email1@company.com, email2@company.com"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddReport}>Kaydet</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>İptal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {scheduledReports.map(report => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{report.reportName}</h3>
                      <p className="text-sm text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getScheduleDescription(report)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <Badge variant={report.enabled ? 'default' : 'secondary'}>
                      {report.enabled ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <span className="text-gray-600">Format: {report.format.toUpperCase()}</span>
                    <span className="text-gray-600">Alıcı: {report.recipients.length} kişi</span>
                    {report.nextRun && (
                      <span className="text-blue-600">
                        Sonraki: {report.nextRun.toLocaleDateString('tr-TR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {report.recipients.map((email, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={report.enabled}
                    onCheckedChange={() => handleToggle(report.id)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunNow(report.id)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {scheduledReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Henüz zamanlanmış rapor yok</p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Raporu Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}



