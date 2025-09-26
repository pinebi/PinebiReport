'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DashboardWidget, DashboardLayout, WidgetTemplate } from '@/types'

interface DashboardContextType {
  // Layout Management
  layout: DashboardLayout | null
  widgets: DashboardWidget[]
  isEditMode: boolean
  selectedWidget: string | null
  
  // Actions
  toggleEditMode: () => void
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => Promise<void>
  deleteWidget: (id: string) => Promise<void>
  moveWidget: (id: string, newPosition: { x: number; y: number; w: number; h: number }) => Promise<void>
  resizeWidget: (id: string, newSize: { width: number; height: number }) => Promise<void>
  setSelectedWidget: (id: string | null) => void
  
  // Layout Actions
  saveLayout: () => Promise<void>
  resetLayout: () => Promise<void>
  loadLayout: (layoutId: string) => Promise<void>
  
  // Templates
  templates: WidgetTemplate[]
  loadTemplates: () => Promise<void>
  
  // State
  isLoading: boolean
  error: string | null
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<DashboardLayout | null>(null)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [templates, setTemplates] = useState<WidgetTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's dashboard layout and widgets
  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const user = localStorage.getItem('user')
      if (!user) return

      const userData = JSON.parse(user)
      const token = localStorage.getItem('token')
      if (!token) return

      const encodedToken = btoa(`${userData.id}:${token}`)

      // Load layout
      const layoutResponse = await fetch('/api/dashboard/layout', {
        headers: {
          'Authorization': `Bearer ${encodedToken}`
        }
      })

      if (layoutResponse.ok) {
        const layoutData = await layoutResponse.json()
        if (layoutData.success) {
          setLayout(layoutData.layout)
        }
      }

      // Load widgets
      const widgetsResponse = await fetch('/api/dashboard/widgets', {
        headers: {
          'Authorization': `Bearer ${encodedToken}`
        }
      })

      if (widgetsResponse.ok) {
        const widgetsData = await widgetsResponse.json()
        if (widgetsData.success) {
          setWidgets(widgetsData.widgets)
        }
      }

      // Load templates
      await loadTemplates()

    } catch (error) {
      console.error('Error loading dashboard:', error)
      setError('Dashboard yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (isEditMode) {
      setSelectedWidget(null)
    }
  }

  const addWidget = async (widgetData: Omit<DashboardWidget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) return

      const userData = JSON.parse(user)
      const encodedToken = btoa(`${userData.id}:${token}`)

      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedToken}`
        },
        body: JSON.stringify(widgetData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWidgets(prev => [...prev, result.widget])
        }
      }
    } catch (error) {
      console.error('Error adding widget:', error)
      setError('Widget eklenirken hata oluştu')
    }
  }

  const updateWidget = async (id: string, updates: Partial<DashboardWidget>) => {
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) return

      const userData = JSON.parse(user)
      const encodedToken = btoa(`${userData.id}:${token}`)

      const response = await fetch(`/api/dashboard/widgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedToken}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
        }
      }
    } catch (error) {
      console.error('Error updating widget:', error)
      setError('Widget güncellenirken hata oluştu')
    }
  }

  const deleteWidget = async (id: string) => {
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) return

      const userData = JSON.parse(user)
      const encodedToken = btoa(`${userData.id}:${token}`)

      const response = await fetch(`/api/dashboard/widgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${encodedToken}`
        }
      })

      if (response.ok) {
        setWidgets(prev => prev.filter(w => w.id !== id))
        if (selectedWidget === id) {
          setSelectedWidget(null)
        }
      }
    } catch (error) {
      console.error('Error deleting widget:', error)
      setError('Widget silinirken hata oluştu')
    }
  }

  const moveWidget = async (id: string, newPosition: { x: number; y: number; w: number; h: number }) => {
    await updateWidget(id, { position: newPosition })
  }

  const resizeWidget = async (id: string, newSize: { width: number; height: number }) => {
    await updateWidget(id, { size: newSize })
  }

  const saveLayout = async () => {
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token || !layout) return

      const userData = JSON.parse(user)
      const encodedToken = btoa(`${userData.id}:${token}`)

      const response = await fetch('/api/dashboard/layout', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedToken}`
        },
        body: JSON.stringify({
          layout: layout.layout,
          widgets: widgets
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLayout(result.layout)
        }
      }
    } catch (error) {
      console.error('Error saving layout:', error)
      setError('Layout kaydedilirken hata oluştu')
    }
  }

  const resetLayout = async () => {
    try {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) return

      const userData = JSON.parse(user)
      const encodedToken = btoa(`${userData.id}:${token}`)

      const response = await fetch('/api/dashboard/layout/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${encodedToken}`
        }
      })

      if (response.ok) {
        await loadDashboard()
      }
    } catch (error) {
      console.error('Error resetting layout:', error)
      setError('Layout sıfırlanırken hata oluştu')
    }
  }

  const loadLayout = async (layoutId: string) => {
    // Implementation for loading specific layout
    console.log('Loading layout:', layoutId)
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/dashboard/templates')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTemplates(result.templates)
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  return (
    <DashboardContext.Provider value={{
      layout,
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
      loadLayout,
      templates,
      loadTemplates,
      isLoading,
      error
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
