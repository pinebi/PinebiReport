'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Building2,
  FileText,
  Eye,
  MoreVertical
} from 'lucide-react'
import { clsx } from 'clsx'

interface DashboardCard {
  id: string
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
  trend?: {
    value: number
    isPositive: boolean
  }
  actionLabel?: string
  actionHref?: string
}

interface TableRow {
  id: string
  automatic: boolean
  name: string
  description: string
  store: string
  status: 'YENİ SİPARİŞ' | 'BEKLEMEDe' | 'TAMAMLANDI'
  date: string
  percentage: number
  actions: string[]
}

const dashboardCards: DashboardCard[] = [
  {
    id: 'pending-delivery',
    title: 'Eksik Teslimat',
    value: '0',
    subtitle: 'Son 1 ay içerisinde eksik teslim edilen sipariş sayısı',
    icon: <Package className="w-6 h-6" />,
    color: 'blue',
    actionLabel: 'Detaylı İncele'
  },
  {
    id: 'waiting-delivery-1',
    title: 'Teslimat Bekleyen - 1',
    value: '0',
    subtitle: 'Belirtilen teslim tarihi geçen siparişler',
    icon: <Clock className="w-6 h-6" />,
    color: 'blue',
    actionLabel: 'Detaylı İncele'
  },
  {
    id: 'waiting-delivery-2',
    title: 'Teslimat Bekleyen - 2',
    value: '1,239',
    subtitle: 'Teslim tarihi belirtilmemiş, 7+ gün geçen siparişler',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'red',
    trend: {
      value: 12.5,
      isPositive: false
    },
    actionLabel: 'Detaylı İncele'
  }
]

const tableData: TableRow[] = [
  {
    id: '1',
    automatic: true,
    name: 'BURÇAY GIDA ECZACIBASI',
    description: 'BURÇAY-ECZACIBASI',
    store: 'P01 MARKET',
    status: 'YENİ SİPARİŞ',
    date: '30.09.2025 13:46:12',
    percentage: 38.26,
    actions: ['İşlemler']
  },
  {
    id: '2',
    automatic: false,
    name: 'KOŞTULAR GIDA',
    description: 'KOŞTULAR-GIDA',
    store: 'MERKEZ MARKET',
    status: 'BEKLEMEDe',
    date: '30.09.2025 11:22:32',
    percentage: 30.1,
    actions: ['İşlemler']
  }
]

const statusColors = {
  'YENİ SİPARİŞ': 'bg-green-100 text-green-800 border-green-200',
  'BEKLEMEDe': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'TAMAMLANDI': 'bg-blue-100 text-blue-800 border-blue-200'
}

const cardColors = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  red: 'bg-red-50 border-red-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200'
}

const iconColors = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600'
}

export function ModernDashboard() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card) => (
            <Card key={card.id} className={clsx(
              'hover:shadow-lg transition-all duration-200 border-2',
              cardColors[card.color]
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={clsx('p-2 rounded-lg bg-white shadow-sm', iconColors[card.color])}>
                    {card.icon}
                  </div>
                  {card.trend && (
                    <div className={clsx(
                      'flex items-center space-x-1 text-sm',
                      card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {card.trend.isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{card.trend.value}%</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-slate-700 text-lg font-semibold">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-slate-800">
                    {card.value}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.subtitle}
                  </p>
                  {card.actionLabel && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={clsx(
                        'w-full mt-3 border-2',
                        card.color === 'blue' && 'border-blue-300 text-blue-700 hover:bg-blue-50',
                        card.color === 'red' && 'border-red-300 text-red-700 hover:bg-red-50'
                      )}
                    >
                      {card.actionLabel}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Delivered Orders */}
        <Card className="mb-8 border-2 border-slate-200">
          <CardHeader className="bg-slate-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Bugün Teslim Alınan Siparişler</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Bugün teslim edilen sipariş bulunmuyor.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Onay Gereken Siparişler (Son 30 Sipariş)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Otomatik</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cari Adı</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Tanım</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Mağaza Adı</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Kayıt Tarihi</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Kâr%</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={row.id} className={clsx(
                      'border-b border-slate-100 hover:bg-slate-50 transition-colors',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                    )}>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {row.automatic ? (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-slate-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.description}</td>
                      <td className="py-3 px-4 text-slate-600">{row.store}</td>
                      <td className="py-3 px-4">
                        <Badge className={clsx(
                          'px-3 py-1 text-xs font-medium rounded-full border',
                          statusColors[row.status]
                        )}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{row.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">%{row.percentage}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-1" />
                          İşlemler
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Revenue Analysis */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-slate-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Ciro Analizi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="text-2xl font-bold text-slate-800 mb-2">₺-19.31</div>
                <p className="text-slate-600">Son 4 haftada bir önceki 4 haftaya düşe Toplam Büyüme Oranı</p>
              </div>
            </CardContent>
          </Card>

          {/* Last 10 Days Revenue */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-slate-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Son 10 Gün Cirosu</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tarih</span>
                  <span className="text-slate-600">Ciro</span>
                </div>
                <div className="text-center py-4">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Veri yükleniyor...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
















