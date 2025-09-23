'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, FileText, BarChart3, Settings, Play, FolderOpen } from 'lucide-react'
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

    // Load categories for all authenticated users
    if (user) {
      loadCategories()
    }
  }, [user, router])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/report-categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // All authenticated users see the dashboard

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

  // Show dashboard for authenticated users
  if (user) {
    return <MainDashboard />
  }
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ERP Raporlama Sistemi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Firma, kullanıcı ve raporları yönetmek için kapsamlı bir çözüm
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <Link href="/companies">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Firma Yönetimi</CardTitle>
                <CardDescription>
                  Firmaları tanımlayın ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Firma Yönetimi
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Kullanıcı Yönetimi</CardTitle>
                <CardDescription>
                  Kullanıcıları tanımlayın ve yetkilendirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Kullanıcı Yönetimi
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Rapor Yönetimi</CardTitle>
                <CardDescription>
                  API bağlantıları ve raporları yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Rapor Yönetimi
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports/run">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Rapor Çalıştırma</CardTitle>
                <CardDescription>
                  Tanımlı raporları çalıştır ve sonuçları görüntüle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Rapor Çalıştır
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/api-config">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">API Yapılandırması</CardTitle>
                <CardDescription>
                  API bağlantıları ve kimlik doğrulama ayarları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  API Ayarları
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Dynamic Category Cards */}
        {categories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Rapor Kategorileri</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {categories
                .filter(category => !category.parentId) // Only parent categories
                .map(category => (
                  <Link key={category.id} href={`/reports/category/${category.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                          <FolderOpen className="w-8 h-8 text-purple-600" />
                        </div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription>
                          {category.description || 'Bu kategorideki raporları görüntüleyin'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">
                            {category.children?.length || 0} alt kategori
                          </p>
                          <Button className="w-full">
                            Kategoriyi Görüntüle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Gelişmiş Raporlama</CardTitle>
              <CardDescription className="text-base">
                Grid ve Pivot görünümleri ile verilerinizi analiz edin. 
                Firma ve kullanıcı bazlı API yapılandırmaları ile güvenli raporlama.
                Excel/CSV export, filtreleme ve gruplama özellikleri.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
