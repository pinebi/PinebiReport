'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReportCategory } from '@/types'
import { MainDashboard } from '@/components/dashboard/main-dashboard'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<ReportCategory[]>([])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    // Load categories for authenticated users
    if (user) {
      loadCategories()
    }
  }, [user, isLoading, router])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/report-categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Since middleware handles auth redirect, we can show dashboard directly
  return <MainDashboard />
}
