'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Banknote, Users, CreditCard, Wallet } from 'lucide-react'

interface KPIData {
  toplamCiro: number
  nakit: number
  krediKarti: number
  nakitKrediKarti: number
  acikHesap: number
}

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2
    }).format(amount) + ' ₺'
  }

  const kpiItems = [
    {
      title: 'Toplam Ciro',
      value: data.toplamCiro,
      icon: <Banknote className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Toplam Ciro'
    },
    {
      title: 'Nakit',
      value: data.nakit,
      icon: <Wallet className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Nakit'
    },
    {
      title: 'Kredi Kartı',
      value: data.krediKarti,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Kredi Kartı'
    },
    {
      title: 'Nakit+Kredi Kartı',
      value: data.nakitKrediKarti,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Nakit+Kredi Kartı'
    },
    {
      title: 'Açık Hesap',
      value: data.acikHesap,
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
