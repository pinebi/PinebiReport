'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface ReportConfig {
  id: string
  name: string
  description: string
  endpointUrl: string
}

export default function DashboardConfigPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportConfig[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}

      // Raporları yükle
      const reportsResponse = await fetch('/api/report-configs', { headers: authHeaders })
      if (reportsResponse.ok) {
        const data = await reportsResponse.json()
        setReports(data.reports || [])
      }

      // Mevcut dashboard config'i yükle
      const configResponse = await fetch('/api/dashboard/config', { headers: authHeaders })
      if (configResponse.ok) {
        const data = await configResponse.json()
        setSelectedReportId(data.reportId || '')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedReportId) {
      alert('Lütfen bir rapor seçin')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}

      const response = await fetch('/api/dashboard/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ reportId: selectedReportId })
      })

      if (response.ok) {
        alert('Dashboard ayarları kaydedildi!')
      } else {
        alert('Kaydetme sırasında hata oluştu')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return <div className="p-8">Lütfen giriş yapın...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Dashboard Ayarları</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ana Dashboard Rapor Seçimi</CardTitle>
          <p className="text-sm text-gray-500">
            Ana dashboard sayfasında hangi raporun kullanılacağını seçin
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="reportId" className="text-base font-semibold mb-2 block">
                Dashboard Raporu *
              </Label>
              <select
                id="reportId"
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                disabled={loading}
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base"
              >
                <option value="">Rapor Seçin...</option>
                {reports.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name} - {report.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Bu rapor ana dashboard'da KPI'lar, grafikler ve tablolar için kullanılacak
              </p>
            </div>

            {selectedReportId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Seçili Rapor</h3>
                <p className="text-sm text-blue-700">
                  {reports.find(r => r.id === selectedReportId)?.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ID: {selectedReportId}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || !selectedReportId}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bilgi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Bu sayfada ana dashboard için kullanılacak raporu seçebilirsiniz</p>
            <p>• Seçilen rapor tüm KPI kartları, grafikler ve tablolar için veri kaynağı olacaktır</p>
            <p>• Rapor değişikliği anında geçerli olur</p>
            <p>• Her firma kendi dashboard raporunu seçebilir</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
