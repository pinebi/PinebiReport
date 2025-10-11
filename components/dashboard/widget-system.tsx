'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Settings, 
  X, 
  GripVertical, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  PieChart
} from 'lucide-react'
import { HoverScale } from '@/hooks/use-ui-animations'

interface Widget {
  id: string
  type: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<any>
  config?: any
  position: { x: number; y: number; w: number; h: number }
}

interface WidgetSystemProps {
  widgets: Widget[]
  onWidgetAdd?: (widget: Widget) => void
  onWidgetRemove?: (widgetId: string) => void
  onWidgetUpdate?: (widgetId: string, config: any) => void
}

const availableWidgets: Omit<Widget, 'id' | 'position'>[] = [
  {
    type: 'revenue-chart',
    title: 'Gelir Grafiği',
    description: 'Aylık gelir trendlerini gösterir',
    icon: <BarChart3 className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-800">Gelir Grafiği</p>
        </div>
      </div>
    )
  },
  {
    type: 'kpi-summary',
    title: 'KPI Özeti',
    description: 'Temel performans göstergeleri',
    icon: <TrendingUp className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Toplam Gelir</span>
          <span className="font-bold">₺125,000</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Büyüme</span>
          <span className="font-bold text-green-600">+12%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Müşteri Sayısı</span>
          <span className="font-bold">1,234</span>
        </div>
      </div>
    )
  },
  {
    type: 'calendar-widget',
    title: 'Takvim',
    description: 'Önemli tarihler ve etkinlikler',
    icon: <Calendar className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="space-y-2">
        <div className="text-center">
          <p className="text-lg font-bold">15</p>
          <p className="text-sm text-gray-600">Ocak</p>
        </div>
        <div className="space-y-1">
          <div className="text-xs bg-blue-100 p-1 rounded">Rapor Teslimi</div>
          <div className="text-xs bg-green-100 p-1 rounded">Toplantı</div>
        </div>
      </div>
    )
  },
  {
    type: 'quick-actions',
    title: 'Hızlı İşlemler',
    description: 'Sık kullanılan işlemler',
    icon: <Settings className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline">Yeni Rapor</Button>
        <Button size="sm" variant="outline">Export</Button>
        <Button size="sm" variant="outline">Ayarlar</Button>
        <Button size="sm" variant="outline">Yardım</Button>
      </div>
    )
  },
  {
    type: 'recent-activity',
    title: 'Son Aktiviteler',
    description: 'Son yapılan işlemler',
    icon: <Users className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="space-y-2">
        <div className="text-sm">
          <p className="font-medium">Yeni rapor oluşturuldu</p>
          <p className="text-gray-500">2 saat önce</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Kullanıcı giriş yaptı</p>
          <p className="text-gray-500">4 saat önce</p>
        </div>
      </div>
    )
  },
  {
    type: 'market-overview',
    title: 'Pazar Genel Bakış',
    description: 'Pazar durumu ve trendler',
    icon: <PieChart className="w-5 h-5" />,
    component: ({ data }: any) => (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Pazar Payı</span>
          <span className="font-bold">%15.2</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '15.2%' }}></div>
        </div>
      </div>
    )
  }
]

export default function WidgetSystem({ 
  widgets, 
  onWidgetAdd, 
  onWidgetRemove, 
  onWidgetUpdate 
}: WidgetSystemProps) {
  const [isAddingWidget, setIsAddingWidget] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const handleAddWidget = useCallback((widgetType: string) => {
    const widgetTemplate = availableWidgets.find(w => w.type === widgetType)
    if (widgetTemplate) {
      const newWidget: Widget = {
        id: `${widgetType}-${Date.now()}`,
        ...widgetTemplate,
        position: { x: 0, y: 0, w: 4, h: 3 }
      }
      onWidgetAdd?.(newWidget)
      setIsAddingWidget(false)
    }
  }, [onWidgetAdd])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    onWidgetRemove?.(widgetId)
  }, [onWidgetRemove])

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null)
  }, [])

  return (
    <div className="space-y-4">
      {/* Widget Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dashboard Widget'ları</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddingWidget(!isAddingWidget)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Widget Ekle
          </Button>
        </div>
      </div>

      {/* Add Widget Panel */}
      {isAddingWidget && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Widget Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableWidgets.map((widget) => (
                <HoverScale key={widget.type} scale={1.02}>
                  <div
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleAddWidget(widget.type)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {widget.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{widget.title}</h4>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                    </div>
                  </div>
                </HoverScale>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {widgets.map((widget) => {
          const WidgetComponent = widget.component
          return (
            <HoverScale key={widget.id} scale={1.02}>
              <Card 
                className="relative group"
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragEnd={handleDragEnd}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        {widget.icon}
                      </div>
                      <CardTitle className="text-sm">{widget.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="cursor-move">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <WidgetComponent data={widget.config} />
                </CardContent>
              </Card>
            </HoverScale>
          )
        })}
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Henüz widget yok</h3>
                <p className="text-gray-500">Dashboard'ınızı özelleştirmek için widget ekleyin</p>
              </div>
              <Button onClick={() => setIsAddingWidget(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Widget'ınızı Ekleyin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Widget Management Hook
export function useWidgetSystem() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  const addWidget = useCallback((widget: Widget) => {
    setWidgets(prev => [...prev, widget])
  }, [])

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }, [])

  const updateWidget = useCallback((widgetId: string, config: any) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
    ))
  }, [])

  const reorderWidgets = useCallback((newOrder: Widget[]) => {
    setWidgets(newOrder)
  }, [])

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets
  }
}













