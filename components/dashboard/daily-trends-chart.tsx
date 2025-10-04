'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar } from 'lucide-react'

interface DailyTrendsData {
  date: string
  amount: number
  formattedDate: string
  dayOfWeek: string
}

interface DailyTrendsChartProps {
  data: DailyTrendsData[]
  title?: string
}

export default function DailyTrendsChart({ data, title = "Günlük Satış Trendleri" }: DailyTrendsChartProps) {
  // Veriyi tarihe göre sırala
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // En yüksek değeri bul (grafik ölçeklendirmesi için)
  const maxAmount = Math.max(...sortedData.map(item => item.amount))
  
  // Haftalık trendleri hesapla
  const weeklyTrends = sortedData.reduce((acc: any, item) => {
    const date = new Date(item.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Pazartesi'den başla
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!acc[weekKey]) {
      acc[weekKey] = { amount: 0, count: 0, dates: [] }
    }
    acc[weekKey].amount += item.amount
    acc[weekKey].count += 1
    acc[weekKey].dates.push(item.formattedDate)
    
    return acc
  }, {})

  const weeklyData = Object.entries(weeklyTrends)
    .map(([week, data]: any) => ({
      week: new Date(week).toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      amount: data.amount,
      avgDaily: Math.round(data.amount / data.count),
      days: data.dates
    }))
    .sort((a, b) => new Date(a.week.split('.').reverse().join('-')).getTime() - new Date(b.week.split('.').reverse().join('-')).getTime())

  // Trend yönünü hesapla
  const calculateTrend = () => {
    if (sortedData.length < 2) return { direction: 'stable', percentage: 0 }
    
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2))
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.amount, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.amount, 0) / secondHalf.length
    
    const percentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
    
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    }
  }

  const trend = calculateTrend()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Son {sortedData.length} gün</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Trend Göstergesi */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Genel Trend</p>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${
                  trend.direction === 'up' ? 'text-green-600' : 
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                  {trend.direction === 'down' && <TrendingUp className="h-4 w-4 rotate-180" />}
                  <span className="font-semibold">
                    {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} 
                    {trend.percentage.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {trend.direction === 'up' ? 'Artış' : trend.direction === 'down' ? 'Azalış' : 'Sabit'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(sortedData.reduce((sum, item) => sum + item.amount, 0))} ₺
              </p>
            </div>
          </div>
        </div>

        {/* Günlük Satış Grafiği */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Günlük Satış Dağılımı</h4>
          <div className="space-y-3">
            {sortedData.map((item, index) => {
              const percentage = (item.amount / maxAmount) * 100
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {item.formattedDate}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {item.amount > 0 && `${new Intl.NumberFormat('tr-TR').format(item.amount)} ₺`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Haftalık Özet */}
        {weeklyData.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Haftalık Özet</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {weeklyData.map((week, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600">{week.week} haftası</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('tr-TR').format(week.amount)} ₺
                  </div>
                  <div className="text-xs text-gray-500">
                    Ortalama: {new Intl.NumberFormat('tr-TR').format(week.avgDaily)} ₺/gün
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
