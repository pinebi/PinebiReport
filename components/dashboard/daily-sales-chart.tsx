'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DailySalesData {
  date: string
  amount: number
  formattedDate?: string
}

interface DailySalesChartProps {
  data: DailySalesData[]
  title?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-lg font-bold text-blue-600 mt-1">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(payload[0].value)}
        </div>
      </div>
    )
  }
  return null
}

export function DailySalesChart({ data = [], title = "Ciro (₺) Günlük" }: DailySalesChartProps) {
  // Default data if none provided
  const defaultData = [
    { date: '2024-01-01', amount: 12000, formattedDate: '1 Ocak' },
    { date: '2024-01-02', amount: 15000, formattedDate: '2 Ocak' },
    { date: '2024-01-03', amount: 18000, formattedDate: '3 Ocak' },
    { date: '2024-01-04', amount: 14000, formattedDate: '4 Ocak' },
    { date: '2024-01-05', amount: 16000, formattedDate: '5 Ocak' },
    { date: '2024-01-06', amount: 19000, formattedDate: '6 Ocak' },
    { date: '2024-01-07', amount: 22000, formattedDate: '7 Ocak' }
  ]

  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                stroke="#2563eb"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}














