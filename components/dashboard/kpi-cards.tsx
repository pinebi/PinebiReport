'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Banknote, Users, CreditCard, Wallet } from 'lucide-react'
import { PinebiLoaderCompact } from '@/components/ui/pinebi-loader'

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
  // Default data if none provided
  const defaultData = {
    toplamCiro: 125000,
    nakit: 45000,
    krediKarti: 38000,
    nakitKrediKarti: 25000,
    acikHesap: 17000
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
                  <PinebiLoaderCompact size="small" />
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

  const kpiData = data

  // Debug log
  console.log('🔍 KPICards received data:', data)
  console.log('🔍 KPICards using kpiData:', kpiData)
  const formatCurrency = (amount: number) => {
    // NaN veya undefined değerleri kontrol et
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0,00 ₺'
    }
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2
    }).format(amount) + ' ₺'
  }

  const kpiItems = [
    {
      title: 'Toplam Ciro',
      value: kpiData.toplamCiro,
      icon: <Banknote className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Toplam Ciro'
    },
    {
      title: 'Nakit',
      value: kpiData.nakit,
      icon: <Wallet className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Nakit'
    },
    {
      title: 'Kredi Kartı',
      value: kpiData.krediKarti,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Kredi Kartı'
    },
    {
      title: 'Nakit+Kredi Kartı',
      value: kpiData.nakitKrediKarti,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Nakit+Kredi Kartı'
    },
    {
      title: 'Açık Hesap',
      value: kpiData.acikHesap,
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Açık Hesap'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {kpiItems.map((item, index) => (
        <Card key={`kpi-${item.title}-${index}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <div className={item.color}>
                  {item.icon}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-bold ${item.color}`}>
                {formatCurrency(item.value)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {item.description}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
