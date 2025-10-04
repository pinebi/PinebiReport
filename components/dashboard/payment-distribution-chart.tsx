'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentData {
  name: string
  value: number
  color: string
}

interface PaymentDistributionChartProps {
  data: PaymentData[]
  title?: string
}

const COLORS = ['#10b981', '#6b7280', '#ef4444', '#f59e0b']

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-lg font-bold text-gray-900 mt-1">
          {new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
          }).format(data.value)}
        </div>
      </div>
    )
  }
  return null
}

export function PaymentDistributionChart({ data = [], title = "Ödeme Dağılımı" }: PaymentDistributionChartProps) {
  // Default data if none provided
  const defaultData = [
    { name: 'Nakit', value: 45, color: '#10b981' },
    { name: 'Kredi Kartı', value: 30, color: '#6b7280' },
    { name: 'Banka Kartı', value: 20, color: '#ef4444' },
    { name: 'Diğer', value: 5, color: '#f59e0b' }
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
            <PieChart>
              <Pie
                data={chartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}








