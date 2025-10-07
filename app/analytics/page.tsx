'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AdvancedAnalytics, { generateMockAnalyticsData } from '@/components/analytics/advanced-analytics'
import PinebiLoader from '@/components/ui/pinebi-loader'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState(generateMockAnalyticsData())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(generateMockAnalyticsData())
      setIsLoading(false)
    }, 1500)
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting analytics data as ${format}`)
    // Implement actual export functionality
  }

  if (authLoading || !user) {
    return (
      <PinebiLoader 
        size="large" 
        text="Analiz verileri yükleniyor..." 
        fullScreen={true}
        variant="modern"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AdvancedAnalytics 
          data={analyticsData}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}






