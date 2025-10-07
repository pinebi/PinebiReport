'use client'

import React, { useState } from 'react'
import { WidgetTemplate } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  PieChart,
  Activity,
  FileText,
  Image,
  Globe
} from 'lucide-react'

interface WidgetLibraryProps {
  templates: WidgetTemplate[]
  onAddWidget: (template: WidgetTemplate) => void
  onClose: () => void
}

const widgetIcons = {
  kpi: DollarSign,
  chart: BarChart3,
  table: TrendingUp,
  gauge: PieChart,
  progress: Activity,
  text: FileText,
  image: Image,
  iframe: Globe
}

const categoryColors = {
  'analytics': 'bg-blue-100 text-blue-800',
  'financial': 'bg-green-100 text-green-800',
  'sales': 'bg-purple-100 text-purple-800',
  'marketing': 'bg-pink-100 text-pink-800',
  'operations': 'bg-orange-100 text-orange-800',
  'custom': 'bg-gray-100 text-gray-800'
}

export function WidgetLibrary({ templates, onAddWidget, onClose }: WidgetLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory && template.isActive
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">Widget Kütüphanesi</CardTitle>
            <CardDescription>
              Dashboard'ınıza eklemek istediğiniz widget'ı seçin
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Widget ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Tümü' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map(template => {
              const Icon = widgetIcons[template.widgetType] || BarChart3
              const categoryColor = categoryColors[template.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
              
              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onAddWidget(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.widgetType}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={categoryColor}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Boyut: {template.config.defaultWidth || 400} × {template.config.defaultHeight || 300}
                      </div>
                      <Button size="sm" className="text-xs">
                        Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Widget Bulunamadı
              </h3>
              <p className="text-gray-500">
                Arama kriterlerinize uygun widget bulunmuyor
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}













