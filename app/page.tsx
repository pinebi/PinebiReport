'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MainDashboard from '@/components/dashboard/main-dashboard'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        router.push('/login')
      }
    }
  }, [user, isLoading, mounted, router])

  // Loading durumunda
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Kullanıcı giriş yapmışsa dashboard göster
  if (user) {
    return <MainDashboard />
  }

  // Kullanıcı giriş yapmamışsa (yönlendirme sırasında)
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Yönlendiriliyor...</p>
      </div>
    </div>
  )
}
