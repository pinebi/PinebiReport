'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

interface MonthlyComparisonData {
  month: string
  currentYear: number
  previousYear: number
  growth: number
  formattedMonth: string
}

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData[]
  title?: string
}

export default function MonthlyComparisonChart({ data, title = "Aylık Karşılaştırma" }: MonthlyComparisonChartProps) {
  // Veriyi aya göre sırala
  const sortedData = [...data].sort((a, b) => {
    const monthOrder = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  })

  // En yüksek değeri bul (grafik ölçeklendirmesi için)
  const maxValue = Math.max(...sortedData.map(item => Math.max(item.currentYear, item.previousYear)))

  // Genel büyüme oranını hesapla
  const totalCurrentYear = sortedData.reduce((sum, item) => sum + item.currentYear, 0)
  const totalPreviousYear = sortedData.reduce((sum, item) => sum + item.previousYear, 0)
  const overallGrowth = totalPreviousYear > 0 ? ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100 : 0

  // En iyi ve en kötü performansı bul
  const bestMonth = sortedData.reduce((best, current) => 
    current.growth > best.growth ? current : best, sortedData[0] || { growth: 0, month: '' })
  
  const worstMonth = sortedData.reduce((worst, current) => 
    current.growth < worst.growth ? current : worst, sortedData[0] || { growth: 0, month: '' })

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>2025 vs 2024</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Genel Performans Özeti */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Genel Büyüme</p>
              <div className={`flex items-center justify-center gap-1 ${
                overallGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overallGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-semibold text-lg">
                  {overallGrowth >= 0 ? '+' : ''}{overallGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">2025 Toplam</p>
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totalCurrentYear)} ₺
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">2024 Toplam</p>
              <p className="text-lg font-bold text-gray-600">
                {new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totalPreviousYear)} ₺
              </p>
            </div>
          </div>
        </div>

        {/* En İyi/En Kötü Performans */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">En İyi Performans</span>
            </div>
            <p className="text-lg font-bold text-green-700">{bestMonth.month}</p>
            <p className="text-sm text-green-600">+{bestMonth.growth.toFixed(1)}% büyüme</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">En Düşük Performans</span>
            </div>
            <p className="text-lg font-bold text-red-700">{worstMonth.month}</p>
            <p className="text-sm text-red-600">{worstMonth.growth.toFixed(1)}% değişim</p>
          </div>
        </div>

        {/* Aylık Karşılaştırma Grafiği */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Aylık Satış Karşılaştırması</h4>
          <div className="space-y-4">
            {sortedData.map((item, index) => {
              const currentPercentage = (item.currentYear / maxValue) * 100
              const previousPercentage = (item.previousYear / maxValue) * 100
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-16">{item.formattedMonth}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">2025</div>
                        <div className="text-sm font-semibold text-green-600">
                          {new Intl.NumberFormat('tr-TR').format(item.currentYear)} ₺
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">2024</div>
                        <div className="text-sm font-semibold text-gray-600">
                          {new Intl.NumberFormat('tr-TR').format(item.previousYear)} ₺
                        </div>
                      </div>
                      <div className={`text-right w-16 ${
                        item.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <div className="text-xs text-gray-500">Değişim</div>
                        <div className="text-sm font-semibold">
                          {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Çift Bar Grafik */}
                  <div className="relative">
                    <div className="space-y-1">
                      {/* 2024 Bar */}
                      <div className="relative">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(currentPercentage, 2)}%` }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-start pl-2 text-xs font-medium text-white">
                          {item.currentYear > 0 && '2025'}
                        </div>
                      </div>
                      
                      {/* 2024 Bar */}
                      <div className="relative">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(previousPercentage, 2)}%` }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-start pl-2 text-xs font-medium text-white">
                          {item.previousYear > 0 && '2024'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span className="text-gray-600">2025 (Bu Yıl)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded"></div>
              <span className="text-gray-600">2024 (Geçen Yıl)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
