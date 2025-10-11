'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Settings, 
  RefreshCw,
  Check,
  Save,
  Eye
} from 'lucide-react'

const predefinedThemes = [
  {
    name: 'Light',
    theme: {
      themeName: 'light',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      sidebarColor: '#f8fafc',
      borderRadius: '0.5rem',
      fontSize: '14px',
      fontFamily: 'Inter',
      darkMode: false
    },
    icon: Sun,
    description: 'Açık tema',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    name: 'Dark',
    theme: {
      themeName: 'dark',
      primaryColor: '#60a5fa',
      secondaryColor: '#94a3b8',
      accentColor: '#fbbf24',
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      sidebarColor: '#111827',
      borderRadius: '0.5rem',
      fontSize: '14px',
      fontFamily: 'Inter',
      darkMode: true
    },
    icon: Moon,
    description: 'Koyu tema',
    color: 'bg-gray-800 text-white'
  },
  {
    name: 'Blue',
    theme: {
      themeName: 'blue',
      primaryColor: '#1e40af',
      secondaryColor: '#475569',
      accentColor: '#3b82f6',
      backgroundColor: '#f0f9ff',
      textColor: '#0f172a',
      sidebarColor: '#e0f2fe',
      borderRadius: '0.75rem',
      fontSize: '14px',
      fontFamily: 'Inter',
      darkMode: false
    },
    icon: Monitor,
    description: 'Mavi tema',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'Green',
    theme: {
      themeName: 'green',
      primaryColor: '#059669',
      secondaryColor: '#6b7280',
      accentColor: '#10b981',
      backgroundColor: '#f0fdf4',
      textColor: '#064e3b',
      sidebarColor: '#dcfce7',
      borderRadius: '0.25rem',
      fontSize: '14px',
      fontFamily: 'Inter',
      darkMode: false
    },
    icon: Palette,
    description: 'Yeşil tema',
    color: 'bg-green-100 text-green-800'
  }
]

export function ThemeSettings() {
  const { theme, updateTheme, resetToDefault, isLoading } = useTheme()
  const [customTheme, setCustomTheme] = useState(theme)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setCustomTheme(theme)
  }, [theme])

  const handlePredefinedTheme = async (themeConfig: any) => {
    await updateTheme(themeConfig.theme)
    setCustomTheme(themeConfig.theme)
  }

  const handleCustomThemeChange = (field: string, value: any) => {
    const updated = { ...customTheme, [field]: value }
    setCustomTheme(updated)
  }

  const applyCustomTheme = async () => {
    await updateTheme(customTheme)
    setShowPreview(false)
  }

  const togglePreview = () => {
    if (showPreview) {
      // Restore original theme
      updateTheme(theme)
    } else {
      // Apply preview theme
      updateTheme(customTheme)
    }
    setShowPreview(!showPreview)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Tema yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Predefined Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Hazır Temalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {predefinedThemes.map((predefinedTheme) => {
            const Icon = predefinedTheme.icon
            const isActive = theme.themeName === predefinedTheme.theme.themeName
            
            return (
              <Card
                key={predefinedTheme.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePredefinedTheme(predefinedTheme)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${predefinedTheme.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold mb-1">{predefinedTheme.name}</h4>
                  <p className="text-sm text-gray-600">{predefinedTheme.description}</p>
                  {isActive && (
                    <Badge className="mt-2" variant="default">
                      <Check className="w-3 h-3 mr-1" />
                      Aktif
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Koyu Mod</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Koyu Mod</p>
                <p className="text-sm text-gray-600">Gözlerinizi yorar daha az</p>
              </div>
            </div>
            <Switch
              checked={customTheme.darkMode}
              onCheckedChange={(checked) => {
                handleCustomThemeChange('darkMode', checked)
                const updated = { ...customTheme, darkMode: checked }
                updateTheme(updated)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Özel Tema Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Renkler</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="primaryColor" className="text-sm mb-2 block">Ana Renk</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={customTheme.primaryColor}
                    onChange={(e) => handleCustomThemeChange('primaryColor', e.target.value)}
                    className="h-10 w-full"
                  />
                  <span className="text-xs text-gray-600">{customTheme.primaryColor}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor" className="text-sm mb-2 block">İkincil Renk</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={customTheme.secondaryColor}
                    onChange={(e) => handleCustomThemeChange('secondaryColor', e.target.value)}
                    className="h-10 w-full"
                  />
                  <span className="text-xs text-gray-600">{customTheme.secondaryColor}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="accentColor" className="text-sm mb-2 block">Vurgu Rengi</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={customTheme.accentColor}
                    onChange={(e) => handleCustomThemeChange('accentColor', e.target.value)}
                    className="h-10 w-full"
                  />
                  <span className="text-xs text-gray-600">{customTheme.accentColor}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="backgroundColor" className="text-sm mb-2 block">Arka Plan</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={customTheme.backgroundColor}
                    onChange={(e) => handleCustomThemeChange('backgroundColor', e.target.value)}
                    className="h-10 w-full"
                  />
                  <span className="text-xs text-gray-600">{customTheme.backgroundColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Tipografi ve Düzen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontSize" className="text-sm mb-2 block">Font Boyutu</Label>
                <Input
                  id="fontSize"
                  value={customTheme.fontSize}
                  onChange={(e) => handleCustomThemeChange('fontSize', e.target.value)}
                  placeholder="14px"
                />
              </div>
              
              <div>
                <Label htmlFor="borderRadius" className="text-sm mb-2 block">Köşe Yuvarlaklığı</Label>
                <Input
                  id="borderRadius"
                  value={customTheme.borderRadius}
                  onChange={(e) => handleCustomThemeChange('borderRadius', e.target.value)}
                  placeholder="0.5rem"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={applyCustomTheme}
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet ve Uygula
            </Button>
            
            <Button
              variant="outline"
              onClick={togglePreview}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Önizlemeyi Kapat' : 'Önizleme'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetToDefault}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sıfırla
            </Button>
          </div>

          {/* Current Theme Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktif Tema:</span>
              <Badge variant="secondary">
                {theme.themeName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



