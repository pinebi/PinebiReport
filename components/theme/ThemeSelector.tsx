'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
    description: 'Açık tema'
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
    description: 'Koyu tema'
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
    description: 'Mavi tema'
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
    description: 'Yeşil tema'
  }
]

export function ThemeSelector() {
  const { theme, updateTheme, resetToDefault, isLoading } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [customTheme, setCustomTheme] = useState(theme)
  const [showPreview, setShowPreview] = useState(false)

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
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="ml-2">Tema yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Palette className="w-4 h-4" />
        Tema
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme Panel */}
          <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-[calc(100vw-1rem)] md:w-96 max-w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Tema Ayarları
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Predefined Themes */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Hazır Temalar
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedThemes.map((predefinedTheme) => {
                    const Icon = predefinedTheme.icon
                    const isActive = theme.themeName === predefinedTheme.theme.themeName
                    
                    return (
                      <Button
                        key={predefinedTheme.name}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePredefinedTheme(predefinedTheme)}
                        className="flex flex-col items-center gap-1 h-auto p-3"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{predefinedTheme.name}</span>
                        {isActive && <Check className="w-3 h-3" />}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Theme Settings */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Özel Tema
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="primaryColor" className="text-xs">Ana Renk</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={customTheme.primaryColor}
                      onChange={(e) => handleCustomThemeChange('primaryColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="text-xs">İkincil Renk</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={customTheme.secondaryColor}
                      onChange={(e) => handleCustomThemeChange('secondaryColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accentColor" className="text-xs">Vurgu Rengi</Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={customTheme.accentColor}
                      onChange={(e) => handleCustomThemeChange('accentColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="backgroundColor" className="text-xs">Arka Plan</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={customTheme.backgroundColor}
                      onChange={(e) => handleCustomThemeChange('backgroundColor', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <Label htmlFor="fontSize" className="text-xs">Font Boyutu</Label>
                    <Input
                      id="fontSize"
                      value={customTheme.fontSize}
                      onChange={(e) => handleCustomThemeChange('fontSize', e.target.value)}
                      placeholder="14px"
                      className="h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="borderRadius" className="text-xs">Köşe Yuvarlaklığı</Label>
                    <Input
                      id="borderRadius"
                      value={customTheme.borderRadius}
                      onChange={(e) => handleCustomThemeChange('borderRadius', e.target.value)}
                      placeholder="0.5rem"
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={customTheme.darkMode}
                    onChange={(e) => handleCustomThemeChange('darkMode', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="darkMode" className="text-xs">
                    Koyu Mod
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  onClick={applyCustomTheme}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Kaydet
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  disabled={isLoading}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {showPreview ? 'İptal' : 'Önizleme'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sıfırla
                </Button>
              </div>

              {/* Current Theme Info */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <Badge variant="secondary" className="text-xs">
                  Aktif: {theme.themeName}
                </Badge>
              </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}
    </div>
  )
}
