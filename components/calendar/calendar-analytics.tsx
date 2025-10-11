'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, Clock, TrendingUp, Users, CheckCircle, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CalendarAnalytics() {
  // Mock analytics data
  const meetingsByHour = [
    { hour: '08:00', count: 2 },
    { hour: '09:00', count: 8 },
    { hour: '10:00', count: 12 },
    { hour: '11:00', count: 10 },
    { hour: '12:00', count: 3 },
    { hour: '13:00', count: 5 },
    { hour: '14:00', count: 15 },
    { hour: '15:00', count: 11 },
    { hour: '16:00', count: 7 },
    { hour: '17:00', count: 4 }
  ]

  const meetingsByDay = [
    { day: 'Pzt', count: 12, avgDuration: 45 },
    { day: 'Sal', count: 15, avgDuration: 52 },
    { day: 'Çar', count: 18, avgDuration: 48 },
    { day: 'Per', count: 14, avgDuration: 55 },
    { day: 'Cum', count: 10, avgDuration: 40 }
  ]

  const eventTypes = [
    { name: 'Toplantı', value: 45, color: '#3b82f6' },
    { name: 'Proje İnceleme', value: 20, color: '#8b5cf6' },
    { name: 'Eğitim', value: 15, color: '#10b981' },
    { name: 'Müşteri Görüşmesi', value: 12, color: '#f59e0b' },
    { name: 'Diğer', value: 8, color: '#6b7280' }
  ]

  const completionRate = [
    { month: 'Haziran', completed: 85, total: 100 },
    { month: 'Temmuz', completed: 90, total: 105 },
    { month: 'Ağustos', completed: 78, total: 95 },
    { month: 'Eylül', completed: 92, total: 110 },
    { month: 'Ekim', completed: 88, total: 100 }
  ]

  const stats = {
    totalEvents: 247,
    completedEvents: 215,
    completionRate: 87,
    avgMeetingDuration: 48,
    totalHours: 198,
    mostProductiveDay: 'Çarşamba',
    mostProductiveHour: '14:00'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Takvim Analizi</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Etkinlik</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamamlanma Oranı</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ort. Toplantı Süresi</p>
                <p className="text-2xl font-bold">{stats.avgMeetingDuration} dk</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Süre</p>
                <p className="text-2xl font-bold">{stats.totalHours} saat</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Saatlere Göre Toplantı Yoğunluğu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={meetingsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                En yoğun saat: <strong>{stats.mostProductiveHour}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Meetings by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Günlere Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={meetingsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Toplantı Sayısı" />
                <Line type="monotone" dataKey="avgDuration" stroke="#10b981" strokeWidth={2} name="Ort. Süre (dk)" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded text-sm">
              <p className="text-green-800 dark:text-green-200">
                <Target className="w-4 h-4 inline mr-1" />
                En verimli gün: <strong>{stats.mostProductiveDay}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Türleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {eventTypes.map(type => (
                <div key={type.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }}></div>
                    <span>{type.name}</span>
                  </div>
                  <span className="font-medium">{type.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Tamamlanma Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Tamamlanan" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#e5e7eb" name="Toplam" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded text-sm">
              <p className="text-purple-800 dark:text-purple-200">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Ortalama tamamlanma: <strong>{stats.completionRate}%</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Öngörüleri ve Öneriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <p className="text-sm">
                <strong>Zaman Optimizasyonu:</strong> Toplantılarınızın %65'i Çarşamba günlerine denk geliyor. 
                Diğer günlere daha dengeli dağıtmak daha verimli olabilir.
              </p>
            </div>
            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
              <p className="text-sm">
                <strong>Verimlilik:</strong> 14:00-15:00 saatleri arasındaki toplantılarınızın tamamlanma oranı %95. 
                Önemli toplantıları bu saatlere almanız önerilir.
              </p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <p className="text-sm">
                <strong>Yük Dengesi:</strong> Bu hafta 18 saat toplantınız var. Geçen haftaya göre %25 artış. 
                Odaklanma süresi için 2-3 saatlik bloklar ayırmanız önerilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



