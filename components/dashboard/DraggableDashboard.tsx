'use client'

import React, { useState, useCallback } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import { DashboardWidget } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Edit3, 
  Save, 
  RotateCcw, 
  Plus, 
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal
} from 'lucide-react'
import { WidgetRenderer } from './WidgetRenderer'
import { WidgetLibrary } from './WidgetLibrary'

export function DraggableDashboard() {
  const {
    widgets,
    isEditMode,
    selectedWidget,
    toggleEditMode,
    addWidget,
    updateWidget,
    deleteWidget,
    moveWidget,
    resizeWidget,
    setSelectedWidget,
    saveLayout,
    resetLayout,
    templates
  } = useDashboard()

  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    if (!isEditMode) return
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
  }, [isEditMode])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWidget || !isEditMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 12))
    const y = Math.floor((e.clientY - rect.top) / 60) // Assuming 60px row height

    await moveWidget(draggedWidget, { x, y, w: 4, h: 3 })
    setDraggedWidget(null)
  }, [draggedWidget, isEditMode, moveWidget])

  const handleWidgetClick = useCallback((widgetId: string) => {
    if (isEditMode) {
      setSelectedWidget(selectedWidget === widgetId ? null : widgetId)
    }
  }, [isEditMode, selectedWidget])

  const handleAddFromTemplate = useCallback(async (template: any) => {
    const newWidget: Omit<DashboardWidget, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      widgetType: template.widgetType,
      title: template.name,
      description: template.description,
      position: { x: 0, y: 0, w: template.config.defaultWidth || 4, h: template.config.defaultHeight || 3 },
      size: { width: template.config.defaultWidth || 400, height: template.config.defaultHeight || 300 },
      config: template.config,
      refreshRate: 300000,
      isVisible: true,
      isCollapsed: false,
      order: widgets.length
    }

    await addWidget(newWidget)
    setShowWidgetLibrary(false)
  }, [addWidget, widgets.length])

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '16px',
    padding: '16px',
    minHeight: '100vh'
  }

  return (
    <div className="relative">
      {/* Dashboard Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            {isEditMode && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Düzenleme Modu
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWidgetLibrary(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Widget Ekle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveLayout}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Kaydet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLayout}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Sıfırla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleEditMode}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Görüntüle
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditMode}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div
        style={gridStyle}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={isEditMode ? 'bg-gray-50 dark:bg-gray-800' : ''}
      >
        {widgets
          .filter(widget => widget.isVisible)
          .sort((a, b) => a.order - b.order)
          .map((widget) => (
            <div
              key={widget.id}
              className={`
                relative
                ${isEditMode ? 'cursor-move' : ''}
                ${selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''}
                ${widget.isCollapsed ? 'opacity-50' : ''}
              `}
              style={{
                gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
                gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
                minHeight: `${widget.position.h * 60}px`
              }}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onClick={() => handleWidgetClick(widget.id)}
            >
              <Card className="h-full w-full overflow-hidden">
                {/* Widget Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {widget.title}
                    </h3>
                    {widget.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {widget.description}
                      </p>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateWidget(widget.id, { isVisible: !widget.isVisible })
                        }}
                      >
                        {widget.isVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWidget(widget.id)
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Widget Content */}
                <div className="p-3 h-full">
                  <WidgetRenderer widget={widget} />
                </div>
              </Card>
            </div>
          ))}

        {/* Empty State */}
        {widgets.length === 0 && (
          <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dashboard Boş
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Widget ekleyerek dashboard'ınızı özelleştirin
            </p>
            {isEditMode && (
              <Button onClick={() => setShowWidgetLibrary(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Widget'ı Ekle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <WidgetLibrary
          templates={templates}
          onAddWidget={handleAddFromTemplate}
          onClose={() => setShowWidgetLibrary(false)}
        />
      )}
    </div>
  )
}




