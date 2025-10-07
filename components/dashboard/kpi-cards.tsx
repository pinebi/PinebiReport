'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Banknote, Users, CreditCard, Wallet } from 'lucide-react'
import { PinebiLoaderCompact } from '@/components/ui/pinebi-loader'
import { SwipeableCard } from '@/components/ui/swipeable-card'
import { HoverScale } from '@/components/ui/hover-scale'

interface KPIData {
  toplamCiro: number
  nakit: number
  krediKarti: number
  nakitKrediKarti: number
  acikHesap: number
}

interface KPICardsProps {
  data: KPIData | null
  loading?: boolean
}

export function KPICards({ data, loading = false }: KPICardsProps) {
  const defaultData = {
    toplamCiro: 0,
    nakit: 0,
    krediKarti: 0,
    nakitKrediKarti: 0,
    acikHesap: 0
  }

  const kpiData = data || defaultData

  console.log('🔍 KPICards received data:', data)
  console.log('🔍 KPICards using kpiData:', kpiData)

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0,00 ₺'
    }
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Loading durumunda skeleton loader göster
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={`kpi-loading-${index}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <PinebiLoaderCompact size="small" variant="pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpiItems = [
    {
      title: 'Toplam Ciro',
      value: kpiData.toplamCiro,
      description: 'Son 30 günlük toplam satış',
      icon: <Banknote className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Nakit Satış',
      value: kpiData.nakit,
      description: 'Nakit ödeme ile yapılan satışlar',
      icon: <Wallet className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Kredi Kartı Satış',
      value: kpiData.krediKarti,
      description: 'Kredi kartı ile yapılan satışlar',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      title: 'Nakit + Kredi Kartı',
      value: kpiData.nakitKrediKarti,
      description: 'Nakit ve Kredi Kartı toplamı',
      icon: <Banknote className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      title: 'Açık Hesap',
      value: kpiData.acikHesap,
      description: 'Açık hesap ile yapılan satışlar',
      icon: <Users className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900'
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {kpiItems.map((item, index) => (
        <HoverScale key={`kpi-${item.title}-${index}`} scale={1.05}>
          <Card className="hover:shadow-lg transition-all duration-300 ease-out">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${item.bgColor}`}>
                  <div className={item.color}>
                    {item.icon}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-bold transition-colors duration-300 ${item.color}`}>
                  {formatCurrency(item.value)}
                </div>
                <div className="text-sm text-gray-600 mt-1 transition-colors duration-300">
                  {item.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      ))}
    </div>
  )
}