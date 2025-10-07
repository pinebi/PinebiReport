'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MainDashboard from '@/components/dashboard/main-dashboard'
import PinebiLoader from '@/components/ui/pinebi-loader'

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
        <PinebiLoader 
          size="large" 
          text="Sistem başlatılıyor..." 
          fullScreen={true}
          variant="modern"
        />
      )
    }

  // Kullanıcı giriş yapmışsa dashboard göster
  if (user) {
    return <MainDashboard />
  }

  // Kullanıcı giriş yapmamışsa (yönlendirme sırasında)
    return (
      <PinebiLoader 
        size="large" 
        text="Yönlendiriliyor..." 
        fullScreen={true}
        variant="pulse"
      />
    )
}
