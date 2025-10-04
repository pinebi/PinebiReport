'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

interface CompanyData {
  company: string
  revenue: number
  customers: number
  marketShare: number
}

interface CompanyPerformanceWidgetProps {
  data: CompanyData[]
  title?: string
  showDetails?: boolean
}

export function CompanyPerformanceWidget({ 
  data = [], 
  title = "Company Performance",
  showDetails = true 
}: CompanyPerformanceWidgetProps) {
  // Debug: Log the incoming data (can be removed in production)
  // console.log('🏢 Company Performance Widget Data:', data)
  // console.log('🏢 Show Details:', showDetails)
  
  // Default data based on the image
  const defaultData: CompanyData[] = [
    {
      company: "Rahmi M.Koç Müzesi",
      revenue: 233678,
      customers: 233,
      marketShare: 91.1
    },
    {
      company: "Rahmi M.Koç Kitaplık", 
      revenue: 13320,
      customers: 47,
      marketShare: 5.2
    },
    {
      company: "Rahmi M.Koç Ayvalık",
      revenue: 7655,
      customers: 24,
      marketShare: 3.0
    },
    {
      company: "Rahmi M.Koç Cunda",
      revenue: 1725,
      customers: 13,
      marketShare: 0.7
    }
  ]

  const displayData = data && data.length > 0 ? data : defaultData

  // Sort by market share (highest first)
  const sortedData = [...displayData].sort((a, b) => b.marketShare - a.marketShare)
  
  // Debug: Log final display data (can be removed in production)
  // console.log('🏢 Final Display Data:', sortedData)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-blue-600'
    if (percentage >= 50) return 'bg-green-600'
    if (percentage >= 20) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getCompanyIcon = (companyName: string) => {
    if (companyName.includes('Müzesi')) return '🏛️'
    if (companyName.includes('Kitaplık')) return '📚'
    if (companyName.includes('Ayvalık')) return '🌊'
    if (companyName.includes('Cunda')) return '🏝️'
    return '🏢'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.map((company, index) => (
          <div key={company.company} className="space-y-3">
            {/* Company Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCompanyIcon(company.company)}</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {company.company}
                  </div>
                  {showDetails && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(company.revenue)} • {company.customers} müşteri
                    </div>
                  )}
                </div>
              </div>
              
              {/* Market Share */}
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {company.marketShare.toFixed(1)}%
                </div>
                {showDetails && (
                  <div className="text-xs text-gray-500">
                    Pazar Payı
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={company.marketShare} 
                className="h-2"
                // Custom progress bar styling
                style={{
                  '--progress-background': '#e5e7eb',
                  '--progress-foreground': getProgressColor(company.marketShare)
                } as React.CSSProperties}
              />
              
              {/* Performance Indicators */}
              {showDetails && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">{company.customers} müşteri</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span>₺{company.customers > 0 ? (company.revenue / company.customers).toFixed(0) : '0'}/müşteri</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-purple-600" />
                    <span>#{index + 1} Sıra</span>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            {index < sortedData.length - 1 && (
              <div className="border-t border-gray-100 dark:border-gray-700"></div>
            )}
          </div>
        ))}

        {/* Summary Stats */}
        {showDetails && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sortedData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Toplam Şirket
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(sortedData.reduce((sum, c) => sum + c.revenue, 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Toplam Ciro
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
