'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Monitor, Projector, Wifi, Coffee, CheckCircle, XCircle } from 'lucide-react'

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  floor: number
  building: string
  equipment: string[]
  amenities: string[]
  isAvailable: boolean
  reservations: Array<{
    startTime: Date
    endTime: Date
    bookedBy: string
  }>
}

interface RoomReservationProps {
  date: Date
  startTime: string
  endTime: string
  onRoomSelect?: (room: MeetingRoom) => void
}

export function RoomReservation({ date, startTime, endTime, onRoomSelect }: RoomReservationProps) {
  const [rooms] = useState<MeetingRoom[]>([
    {
      id: 'room_1',
      name: 'Toplantı Odası A',
      capacity: 10,
      floor: 1,
      building: 'Ana Bina',
      equipment: ['Projeksiyon', 'Beyaz Tahta', 'Video Konferans', '4K TV'],
      amenities: ['Wi-Fi', 'Kahve Makinesi', 'Flip Chart'],
      isAvailable: true,
      reservations: []
    },
    {
      id: 'room_2',
      name: 'Yönetim Kurulu Salonu',
      capacity: 20,
      floor: 2,
      building: 'Ana Bina',
      equipment: ['Projeksiyon', 'Video Konferans', '4K TV', 'Ses Sistemi'],
      amenities: ['Wi-Fi', 'Kahve Makinesi', 'Su Sebili', 'Klima'],
      isAvailable: false,
      reservations: [
        {
          startTime: new Date('2025-10-08T10:00:00'),
          endTime: new Date('2025-10-08T12:00:00'),
          bookedBy: 'Ahmet Yılmaz'
        }
      ]
    },
    {
      id: 'room_3',
      name: 'Huddle Room 1',
      capacity: 4,
      floor: 1,
      building: 'Ana Bina',
      equipment: ['TV', 'Video Konferans'],
      amenities: ['Wi-Fi'],
      isAvailable: true,
      reservations: []
    },
    {
      id: 'room_4',
      name: 'Eğitim Salonu',
      capacity: 30,
      floor: 3,
      building: 'Ana Bina',
      equipment: ['Projeksiyon', 'Ses Sistemi', 'Mikrofon', 'Video Konferans'],
      amenities: ['Wi-Fi', 'Kahve Makinesi', 'Flip Chart', 'Klima'],
      isAvailable: true,
      reservations: []
    }
  ])

  const getEquipmentIcon = (equipment: string) => {
    if (equipment.toLowerCase().includes('projeksiyon')) return <Projector className="w-4 h-4" />
    if (equipment.toLowerCase().includes('tv')) return <Monitor className="w-4 h-4" />
    if (equipment.toLowerCase().includes('video')) return <Monitor className="w-4 h-4" />
    return null
  }

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi') || amenity.toLowerCase().includes('wi-fi')) return <Wifi className="w-4 h-4" />
    if (amenity.toLowerCase().includes('kahve')) return <Coffee className="w-4 h-4" />
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Toplantı Odası Rezervasyonu</h2>
        <div className="text-sm text-gray-600">
          {date.toLocaleDateString('tr-TR')} • {startTime} - {endTime}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map(room => (
          <Card key={room.id} className={room.isAvailable ? 'hover:shadow-lg transition-shadow' : 'opacity-60'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {room.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {room.building} • Kat {room.floor}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {room.isAvailable ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Müsait
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Dolu
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Kapasite: {room.capacity} kişi</span>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Ekipman:</p>
                <div className="flex flex-wrap gap-2">
                  {room.equipment.map((eq, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {getEquipmentIcon(eq)}
                      {eq}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Olanaklar:</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {room.reservations.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Mevcut Rezervasyonlar:</p>
                  {room.reservations.map((res, index) => (
                    <div key={index} className="text-xs text-gray-600 mb-1">
                      {res.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - 
                      {res.endTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • 
                      {res.bookedBy}
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!room.isAvailable}
                onClick={() => onRoomSelect && onRoomSelect(room)}
              >
                {room.isAvailable ? 'Rezervasyon Yap' : 'Müsait Değil'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



