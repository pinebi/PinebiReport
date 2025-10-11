'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Trash2 } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
  onUpdate: () => void
  isLiveData?: boolean
  lastUpdate?: Date | null
}

export function DashboardHeader({ 
  title, 
  startDate, 
  endDate, 
  onDateChange, 
  onUpdate,
  isLiveData = false,
  lastUpdate = null
}: DashboardHeaderProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleUpdate = () => {
    onDateChange(localStartDate, localEndDate)
    onUpdate()
  }

  const handleClearCache = () => {
    // Tüm dashboard cache'lerini temizle
    const keys = Object.keys(localStorage);
    let cleared = 0;
    keys.forEach(key => {
      if (key.startsWith('dashboard_')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    console.log(`🗑️ ${cleared} cache silindi`);
    alert(`Cache temizlendi! (${cleared} kayıt silindi)\n\nSayfa yenileniyor...`);
    window.location.reload();
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('tr-TR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Başlangıç:</label>
              <Input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Bitiş:</label>
              <Input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            
            <Button 
              onClick={handleUpdate}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Güncelle
            </Button>

            <Button 
              onClick={handleClearCache}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cache Temizle
            </Button>

          </div>
        </CardContent>
      </Card>

    </div>
  )
}





