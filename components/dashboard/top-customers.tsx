'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CustomerData {
  name: string
  amount: number
  rank: number
  change?: number // Percentage change from previous period
}

interface TopCustomersProps {
  data: CustomerData[]
  title?: string
}

export function TopCustomers({ data, title = "Ürün Satışı Top 10" }: TopCustomersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBarWidth = (amount: number, maxAmount: number) => {
    return Math.max(5, (amount / maxAmount) * 100)
  }

  const maxAmount = Math.max(...data.map(item => item.amount))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((customer, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {customer.rank}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {customer.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(customer.amount)}
                </span>
              </div>
              
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${getBarWidth(customer.amount, maxAmount)}%` }}
                />
              </div>
              
              {customer.change !== undefined && (
                <div className="mt-1 text-right">
                  <span 
                    className={`text-xs ${
                      customer.change > 0 
                        ? 'text-green-600' 
                        : customer.change < 0 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                    }`}
                  >
                    {customer.change > 0 ? '+' : ''}{customer.change.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}








