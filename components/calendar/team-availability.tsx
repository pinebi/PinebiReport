'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, CheckCircle, XCircle, Minus } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  availability: {
    [key: string]: {
      status: 'available' | 'busy' | 'tentative' | 'out-of-office'
      events: Array<{
        title: string
        startTime: string
        endTime: string
      }>
    }
  }
}

export function TeamAvailability() {
  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8:00 - 17:00
  const [selectedDate] = useState(new Date())

  const [team] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@company.com',
      role: 'Proje Yöneticisi',
      availability: {
        '09:00': { status: 'busy', events: [{ title: 'Standup Meeting', startTime: '09:00', endTime: '09:30' }] },
        '10:00': { status: 'available', events: [] },
        '11:00': { status: 'available', events: [] },
        '14:00': { status: 'busy', events: [{ title: 'Müşteri Görüşmesi', startTime: '14:00', endTime: '15:30' }] },
        '15:00': { status: 'busy', events: [{ title: 'Müşteri Görüşmesi', startTime: '14:00', endTime: '15:30' }] },
        '16:00': { status: 'tentative', events: [{ title: 'Planlama Toplantısı', startTime: '16:00', endTime: '17:00' }] }
      }
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      email: 'ayse@company.com',
      role: 'Kıdemli Geliştirici',
      availability: {
        '09:00': { status: 'busy', events: [{ title: 'Standup Meeting', startTime: '09:00', endTime: '09:30' }] },
        '10:00': { status: 'busy', events: [{ title: 'Kod Review', startTime: '10:00', endTime: '11:00' }] },
        '11:00': { status: 'available', events: [] },
        '13:00': { status: 'available', events: [] },
        '14:00': { status: 'available', events: [] },
        '15:00': { status: 'busy', events: [{ title: 'Teknik Toplantı', startTime: '15:00', endTime: '16:00' }] }
      }
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      email: 'mehmet@company.com',
      role: 'Backend Developer',
      availability: {
        '09:00': { status: 'out-of-office', events: [{ title: 'İzinli', startTime: '09:00', endTime: '17:00' }] },
        '10:00': { status: 'out-of-office', events: [{ title: 'İzinli', startTime: '09:00', endTime: '17:00' }] },
        '11:00': { status: 'out-of-office', events: [{ title: 'İzinli', startTime: '09:00', endTime: '17:00' }] },
        '14:00': { status: 'out-of-office', events: [{ title: 'İzinli', startTime: '09:00', endTime: '17:00' }] },
        '15:00': { status: 'out-of-office', events: [{ title: 'İzinli', startTime: '09:00', endTime: '17:00' }] }
      }
    },
    {
      id: '4',
      name: 'Fatma Özdemir',
      email: 'fatma@company.com',
      role: 'QA Engineer',
      availability: {
        '09:00': { status: 'busy', events: [{ title: 'Standup Meeting', startTime: '09:00', endTime: '09:30' }] },
        '10:00': { status: 'available', events: [] },
        '11:00': { status: 'busy', events: [{ title: 'Test Review', startTime: '11:00', endTime: '12:00' }] },
        '14:00': { status: 'available', events: [] },
        '15:00': { status: 'available', events: [] }
      }
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'tentative': return 'bg-yellow-500'
      case 'out-of-office': return 'bg-gray-500'
      default: return 'bg-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />
      case 'busy': return <XCircle className="w-4 h-4" />
      case 'tentative': return <Minus className="w-4 h-4" />
      case 'out-of-office': return <XCircle className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait'
      case 'busy': return 'Meşgul'
      case 'tentative': return 'Belirsiz'
      case 'out-of-office': return 'Ofis Dışı'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Ekip Müsaitliği
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' })}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Müsait</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Meşgul</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Belirsiz</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Ofis Dışı</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 w-64 bg-gray-50 dark:bg-gray-900 sticky left-0 z-10">
                    Takım Üyesi
                  </th>
                  {hours.map(hour => (
                    <th key={hour} className="text-center p-2 min-w-[80px] text-xs font-medium bg-gray-50 dark:bg-gray-900">
                      {hour.toString().padStart(2, '0')}:00
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {team.map(member => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4 sticky left-0 bg-white dark:bg-gray-950 border-r">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    {hours.map(hour => {
                      const hourKey = `${hour.toString().padStart(2, '0')}:00`
                      const slot = member.availability[hourKey]
                      const status = slot?.status || 'available'

                      return (
                        <td key={hour} className="p-0">
                          <div
                            className={`h-16 flex items-center justify-center cursor-pointer group relative ${getStatusColor(status)}`}
                            title={slot?.events[0]?.title || getStatusLabel(status)}
                          >
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              {getStatusIcon(status)}
                            </div>
                            
                            {/* Tooltip */}
                            {slot?.events && slot.events.length > 0 && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                <div className="bg-gray-900 text-white text-xs rounded p-2 whitespace-nowrap shadow-lg">
                                  <div className="font-semibold">{slot.events[0].title}</div>
                                  <div className="text-gray-300">
                                    {slot.events[0].startTime} - {slot.events[0].endTime}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-gray-600">Şu An Müsait</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-600">Meşgul</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-600">Ofis Dışı</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">14:00</p>
              <p className="text-sm text-gray-600">En Uygun Saat</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



