'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, FileText, BarChart3, Settings, Play, FolderOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReportCategory } from '@/types'
// Modern dashboard artık direkt burada implement edildi

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
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Modern Dashboard Content */}
        <div className="p-6">
          {/* Top Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {/* Canlı Ciro */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Canlı Ciro</h3>
                <div className="text-2xl font-bold text-gray-900">₺4.2M</div>
                <div className="text-sm text-gray-500">Bugün</div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  Detaylı İncele
                </button>
              </div>
            </div>

            {/* Bu Hafta Ciro */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Bu Hafta</h3>
                <div className="text-2xl font-bold text-gray-900">₺28.5M</div>
                <div className="text-sm text-gray-500">Bu Hafta</div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  Detaylı İncele
                </button>
              </div>
            </div>

            {/* 15 Günlük Hareketsiz Ürünler */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">15 Günlük Hareketsiz Ürünler</h3>
                <div className="text-2xl font-bold text-yellow-600">18,887</div>
                <div className="text-sm text-gray-500">Çeşit</div>
                <button className="w-full mt-3 px-4 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors">
                  ⚠ Detaylı İncele
                </button>
              </div>
            </div>

            {/* Toplam Stok */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Toplam Stok</h3>
                <div className="text-2xl font-bold text-yellow-600">1.2M</div>
                <div className="text-sm text-gray-500">Toplam Stok</div>
                <button className="w-full mt-3 px-4 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors">
                  ⚠ Detaylı İncele
                </button>
              </div>
            </div>

            {/* Top 250 Ürünün Ciroya Katkısı */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Top 250 Ürünün Ciroya Katkısı</h3>
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-lg font-bold text-green-600">%68.5</div>
                    <div className="text-xs text-gray-500">Miktarsal Katkı</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">%72.3</div>
                    <div className="text-xs text-gray-500">Finansal Katkı</div>
                  </div>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                  ✓ Detaylı İncele
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Dashboard Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Eksik Teslimat */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Eksik Teslimat</h3>
                <div className="text-4xl font-bold text-blue-600">0</div>
                <p className="text-sm text-gray-600">Son 1 ay içerisinde eksik teslim edilen sipariş sayısı</p>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <span>Detaylı İncele</span>
                </button>
              </div>
            </div>

            {/* Teslimat Bekleyen - 1 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Teslimat Bekleyen - 1</h3>
                <div className="text-4xl font-bold text-gray-600">0</div>
                <p className="text-sm text-gray-600">Belirtilen teslim tarihi geçen siparişler</p>
                <button className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <span>Detaylı İncele</span>
                </button>
              </div>
            </div>

            {/* Teslimat Bekleyen - 2 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Teslimat Bekleyen - 2</h3>
                <div className="text-4xl font-bold text-red-600">1,239</div>
                <p className="text-sm text-gray-600">Teslim tarihi belirtilmemiş, 7+ gün geçen siparişler</p>
                <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                  <span>⚠ Detaylı İncele</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bugün Teslim Alınan Siparişler */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="bg-slate-700 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>Bugün Teslim Alınan Siparişler</span>
              </h2>
            </div>
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">Bugün teslim edilen sipariş bulunmuyor.</p>
            </div>
          </div>
        </div>
      </div>
    )
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

          {/* Rapor Çalıştırma kartı kaldırıldı */}

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
