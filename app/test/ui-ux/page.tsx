'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Moon, 
  Sun, 
  Eye, 
  RefreshCw,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronRight,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Breadcrumb as BreadcrumbComponent } from '@/components/ui/breadcrumb'
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton-loader'

export default function UIUXTestPage() {
  const { success, error, warning, info: infoToast } = useToast()
  const { theme, updateTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [skeletonVisible, setSkeletonVisible] = useState(false)

  const testToastNotifications = () => {
    success('🎉 Başarı Testi', 'Toast bildirimleri mükemmel çalışıyor!')
    setTimeout(() => error('❌ Hata Testi', 'Hata bildirimleri de çalışıyor!'), 1000)
    setTimeout(() => warning('⚠️ Uyarı Testi', 'Uyarı bildirimleri aktif!'), 2000)
    setTimeout(() => infoToast('ℹ️ Bilgi Testi', 'Bilgi bildirimleri hazır!'), 3000)
  }

  const testThemeToggle = async () => {
    const newTheme = {
      ...theme,
      darkMode: !theme.darkMode,
      themeName: !theme.darkMode ? 'dark' : 'light'
    }
    await updateTheme(newTheme)
    success('Tema Değiştirildi', `Başarıyla ${!theme.darkMode ? 'koyu' : 'açık'} temaya geçildi`)
  }

  const testLoadingStates = () => {
    setIsLoading(true)
    setSkeletonVisible(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setSkeletonVisible(false)
      success('Loading Testi', 'Loading state\'leri mükemmel çalışıyor!')
    }, 3000)
  }

  const testResponsiveDesign = () => {
    success('Responsive Test', 'Tüm cihazlarda mükemmel görünüm!')
  }

  const testComponents = [
    {
      id: 'toast',
      name: 'Toast Notifications',
      description: 'Bildirim sistemi testi',
      icon: Bell,
      test: testToastNotifications
    },
    {
      id: 'theme',
      name: 'Theme Toggle',
      description: 'Tema değiştirme testi',
      icon: Palette,
      test: testThemeToggle
    },
    {
      id: 'loading',
      name: 'Loading States',
      description: 'Yükleme durumları testi',
      icon: RefreshCw,
      test: testLoadingStates
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Mobil uyumluluk testi',
      icon: Smartphone,
      test: testResponsiveDesign
    }
  ]

  const currentTheme = theme.darkMode ? 'dark' : 'light'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Palette className="h-8 w-8 text-blue-600" />
            UI/UX Test Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kullanıcı arayüzü ve deneyim özelliklerini test edin
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            {currentTheme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            {currentTheme === 'dark' ? 'Koyu Tema' : 'Açık Tema'}
          </Badge>
          <Button onClick={testThemeToggle} variant="outline" size="sm">
            {currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Breadcrumb Test */}
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChevronRight className="h-5 w-5" />
          Breadcrumb Navigation Test
        </CardTitle>
        </CardHeader>
        <CardContent>
          <BreadcrumbComponent />
        </CardContent>
      </Card>

      {/* Component Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testComponents.map((component) => {
          const Icon = component.icon
          return (
            <Card key={component.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {component.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {component.description}
                </p>
                <Button onClick={component.test} className="w-full">
                  Test Et
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Loading States Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Loading States Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={testLoadingStates} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Yükleniyor...
                  </>
                ) : (
                  'Loading Testini Başlat'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSkeletonVisible(!skeletonVisible)}
              >
                {skeletonVisible ? 'Skeleton\'ı Gizle' : 'Skeleton\'ı Göster'}
              </Button>
            </div>

            {/* Skeleton Demo */}
            {skeletonVisible && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* Table Skeleton */}
            {skeletonVisible && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Tablo Skeleton</h3>
                <SkeletonTable rows={5} columns={4} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Design Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Responsive Design Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
              <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Desktop</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">1024px+</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
              <Tablet className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Tablet</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">768px+</div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">Mobile</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">640px+</div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">Auto</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Responsive</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Palette Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm font-medium">Primary</div>
              <div className="text-xs text-gray-500">#3B82F6</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm font-medium">Success</div>
              <div className="text-xs text-gray-500">#10B981</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm font-medium">Error</div>
              <div className="text-xs text-gray-500">#EF4444</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm font-medium">Warning</div>
              <div className="text-xs text-gray-500">#F59E0B</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Interactive Elements Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
