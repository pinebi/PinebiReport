'use client'

import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridReadyEvent, GridApi, ColumnApi, SideBarDef } from 'ag-grid-community'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, Maximize, Columns, Filter, Eye, EyeOff, Save, RotateCcw, Palette, Type, Download, Printer, FileSpreadsheet, FileText, FileImage } from 'lucide-react'
import { AG_GRID_LOCALE_TR } from '@/lib/ag-grid-locale'
import { useAuth } from '@/contexts/AuthContext'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/styles/ag-grid-custom.css'

// Optional Enterprise load (only if license provided)
let enterpriseLoaded = false
if (typeof window !== 'undefined' && !enterpriseLoaded) {
  try {
    const hasEnterprise = (window as any)?.__AG_GRID_ENTERPRISE__ || process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY
    if (hasEnterprise) {
  import('ag-grid-enterprise').then(() => {
    enterpriseLoaded = true
    console.log('AG-Grid Enterprise loaded')
  }).catch(err => {
    console.warn('AG-Grid Enterprise could not be loaded:', err)
  })
    }
  } catch {}
}

// Using community default build; no explicit module registration to avoid bundling issues

interface EnhancedDataGridProps {
  data: any[]
  columnDefs: ColDef[]
  title: string
  gridType?: string
  onAdd?: () => void
  onEdit?: (data: any) => void
  onDelete?: (data: any) => void
  onCellClicked?: (params: any) => void
  onRowClicked?: (params: any) => void
  loading?: boolean
  theme?: 'default' | 'blue' | 'green' | 'purple' | 'orange'
  forcePivot?: boolean
}

export function EnhancedDataGrid({ 
  data, 
  columnDefs, 
  title, 
  gridType,
  onAdd, 
  onEdit, 
  onDelete,
  onCellClicked,
  onRowClicked,
  loading = false,
  theme = 'default',
  forcePivot = false
}: EnhancedDataGridProps) {
  
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null)
  const [multiSelectFilters, setMultiSelectFilters] = useState<Record<string, Set<any>>>({})
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false)
  const [pivotMode, setPivotMode] = useState<boolean>(false)
  const { user, isLoading: authLoading } = useAuth()
  const [currentTheme, setCurrentTheme] = useState(theme)

  // Force grid refresh when theme changes
  useEffect(() => {
    if (gridApi) {
      gridApi.refreshCells({ force: true })
    }
  }, [currentTheme, gridApi])

  // Load grid settings from database and localStorage
  const loadGridSettings = useCallback(async () => {
    console.log('=== LOAD GRID SETTINGS DEBUG ===')
    console.log('user?.id:', user?.id)
    console.log('gridType:', gridType)
    console.log('gridApi:', !!gridApi)
    console.log('gridColumnApi:', !!gridColumnApi)
    
    if (!user?.id || !gridType || !gridApi || !gridColumnApi) {
      console.log('❌ Load koşulları sağlanmadı')
      return
    }

    try {
      // Try to load from localStorage first (faster)
      const storageKey = `grid-settings-${user.id}-${user.companyId || 'no-company'}-${gridType}`
      console.log('🔍 Storage key:', storageKey)
      
      const localSettings = localStorage.getItem(storageKey)
      console.log('📦 localStorage data:', localSettings ? 'FOUND' : 'NOT FOUND')
      
      if (localSettings) {
        console.log('📦 Raw localStorage data length:', localSettings.length)
        const settings = JSON.parse(localSettings)
        console.log('✅ Parsed settings keys:', Object.keys(settings))
        
        if (settings.columnSettings) {
          console.log('📊 Column settings found, length:', settings.columnSettings.length)
          try {
            if (gridApi && !gridApi.isDestroyed?.() && gridApi.applyColumnState) {
            console.log('✅ Using gridApi.applyColumnState')
            gridApi.applyColumnState({ state: settings.columnSettings, applyOrder: true })
            } else if (gridColumnApi && gridColumnApi.applyColumnState) {
            console.log('✅ Using gridColumnApi.applyColumnState')
            gridColumnApi.applyColumnState({ state: settings.columnSettings, applyOrder: true })
            }
          } catch (error) {
            console.warn('⚠️ Column settings error:', error)
          }
        } else {
          console.log('❌ No column settings found')
        }
        
        if (settings.filterSettings) {
          console.log('🔍 Filter settings found:', Object.keys(settings.filterSettings))
          try {
            if (gridApi && !gridApi.isDestroyed?.()) {
          gridApi.setFilterModel(settings.filterSettings)
            }
          } catch (error) {
            console.warn('⚠️ Filter settings error:', error)
          }
        } else {
          console.log('❌ No filter settings found')
        }
        
        if (settings.sortSettings && (gridApi as any).setSortModel) {
          console.log('↕️ Sort settings found:', settings.sortSettings.length)
          try {
            if (gridApi && !gridApi.isDestroyed?.()) {
              ;(gridApi as any).setSortModel(settings.sortSettings)
            }
          } catch (error) {
            console.warn('⚠️ Sort settings error:', error)
          }
        } else {
          console.log('❌ No sort settings found')
        }
        
        if (settings.sidebarSettings?.visible && gridApi.setSideBarVisible) {
          console.log('📋 Sidebar settings found:', settings.sidebarSettings.visible)
          try {
            if (gridApi && !gridApi.isDestroyed?.()) {
          gridApi.setSideBarVisible(settings.sidebarSettings.visible)
          setSidebarVisible(settings.sidebarSettings.visible)
            }
          } catch (error) {
            console.warn('⚠️ Sidebar settings error:', error)
          }
        } else {
          console.log('❌ No sidebar settings found')
        }

        if (typeof settings.pivotMode === 'boolean') {
          try {
            setPivotMode(!!settings.pivotMode)
            if (gridApi && !gridApi.isDestroyed?.() && (gridApi as any).setPivotMode) {
              ;(gridApi as any).setPivotMode(!!settings.pivotMode)
            }
          } catch (error) {
            console.warn('⚠️ Pivot mode apply error:', error)
          }
        }
        
        if (settings.themeSettings?.theme) {
          console.log('🎨 Theme settings found:', settings.themeSettings.theme)
          setCurrentTheme(settings.themeSettings.theme)
        } else {
          console.log('❌ No theme settings found')
        }
        
        console.log('✅ Grid ayarları başarıyla yüklendi!')
      } else {
        // SQL'den getir
        try {
          const qs = new URLSearchParams({ userId: user.id, gridType })
          const res = await fetch(`/api/user-grid-settings?${qs.toString()}`)
          if (res.ok) {
            const json = await res.json()
            const s = json?.settings
            if (s) {
              let col = s.columnSettings
              let fil = s.filterSettings
              let sor = s.sortSettings
              let vp = s.viewPreferences
              try { if (typeof col === 'string') col = JSON.parse(col) } catch {}
              try { if (typeof fil === 'string') fil = JSON.parse(fil) } catch {}
              try { if (typeof sor === 'string') sor = JSON.parse(sor) } catch {}
              try { if (typeof vp === 'string') vp = JSON.parse(vp) } catch {}

              // Uyum için kısa/uzun anahtarları destekle
              const colState = (col || []).map((c: any) => ({
                colId: c.colId || c.id,
                hide: typeof c.hide !== 'undefined' ? c.hide : !!c.h,
                pinned: c.pinned ?? c.p ?? null,
                sort: c.sort || c.s,
                sortIndex: typeof c.sortIndex === 'number' ? c.sortIndex : c.si,
                width: typeof c.width === 'number' ? c.width : c.w,
                flex: typeof c.flex === 'number' ? c.flex : c.f,
                rowGroup: c.rowGroup || !!c.rg,
                rowGroupIndex: typeof c.rowGroupIndex === 'number' ? c.rowGroupIndex : c.rgi,
                pivot: c.pivot || !!c.pv,
                pivotIndex: typeof c.pivotIndex === 'number' ? c.pivotIndex : c.pvi,
                aggFunc: c.aggFunc || c.a,
                value: c.value || !!c.v
              }))

              if (colState?.length) {
                try {
                  if (gridApi?.applyColumnState) {
                    gridApi.applyColumnState({ state: colState, applyOrder: true })
                  } else if (gridColumnApi?.applyColumnState) {
                    gridColumnApi.applyColumnState({ state: colState, applyOrder: true })
                  }
                } catch (e) { console.warn('SQL colState apply error', e) }
              }
              if (fil && gridApi) {
                try { gridApi.setFilterModel(fil) } catch (e) { console.warn('SQL filter apply error', e) }
              }
              if (sor && (gridApi as any).setSortModel) {
                try { (gridApi as any).setSortModel(sor) } catch (e) { console.warn('SQL sort apply error', e) }
              }
              const pv = vp?.pivotMode ?? vp?.pv
              if (typeof pv === 'boolean') {
                try {
                  setPivotMode(!!pv)
                  if ((gridApi as any).setPivotMode) (gridApi as any).setPivotMode(!!pv)
                } catch {}
              }
              const th = vp?.theme ?? vp?.t
              if (th) setCurrentTheme(th)

              console.log('✅ SQL grid ayarları yüklendi')
            }
          }
        } catch (e) {
          console.warn('SQL settings fetch error:', e)
        }
      }
    } catch (error) {
      console.error('❌ Grid ayarları yüklenirken hata:', error)
    }
  }, [gridApi, gridColumnApi, user?.id, gridType])

  // Calculate totals
  const calculateTotals = useMemo(() => {
    if (!data || data.length === 0) return null

    const totals: any = {}
    const firstRow = data[0]
    
    Object.keys(firstRow).forEach(key => {
      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined)
      const numericValues = values.filter(val => !isNaN(Number(val)) && val !== '')
      
      if (numericValues.length > values.length * 0.7) {
        const sum = numericValues.reduce((acc, val) => acc + Number(val), 0)
        totals[key] = sum
      } else {
        if (key === Object.keys(firstRow)[0]) {
          totals[key] = 'TOPLAM'
        } else {
          totals[key] = ''
        }
      }
    })

    return totals
  }, [data])


  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    
    // Sidebar is not available in community edition
    setSidebarVisible(false)
    
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
      if (params.api.autoSizeAllColumns) {
        params.api.autoSizeAllColumns(false)
          } else if (params.columnApi && params.columnApi.autoSizeAllColumns) {
        params.columnApi.autoSizeAllColumns(false)
      }
      
      setTimeout(() => {
            if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit()
            }
      }, 200)
        }
      } catch (error) {
        console.warn('⚠️ Auto-size error:', error)
      }
    }, 100)

    // Debounced resize to avoid excessive reflows
    let resizeTimer: any
    const handleResize = () => {
      try {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit()
          }
        }, 150)
      } catch (error) {
        console.warn('⚠️ Resize error:', error)
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Apply forced pivot if requested
    if (forcePivot) {
      console.log('🔧 Force pivot detected, applying...')
      try {
        // Try to register Enterprise RowGrouping module dynamically if available (no await to avoid async context)
        try {
          const importer: any = (new Function('s', 'return import(s)'))
          importer('@ag-grid-enterprise/row-grouping')
            .then((mod: any) => {
              try {
                // ModuleRegistry should already be imported from '@ag-grid-community/core'
                const mr: any = (window as any)?.agGrid?.ModuleRegistry || (globalThis as any)?.agGrid?.ModuleRegistry
                mr?.registerModules?.([ mod?.RowGroupingModule ])
                console.log('✅ RowGroupingModule registered')
              } catch (err) {
                console.warn('RowGrouping register error:', err as Error)
              }
            })
            .catch(() => {
              console.warn('RowGroupingModule not available; pivot may not render')
            })
        } catch (e) {
          console.warn('RowGrouping dynamic load error:', e as Error)
        }

        setPivotMode(true)
        if ((params.api as any).setPivotMode) {
          ;(params.api as any).setPivotMode(true)
        }
        
        // Also set via grid options immediately
        ;(params.api as any).setGridOption?.('pivotMode', true)
        ;(params.api as any).setGridOption?.('groupDisplayType', 'groupRows')
        ;(params.api as any).setGridOption?.('groupDefaultExpanded', -1)
        ;(params.api as any).setGridOption?.('groupIncludeFooter', true)
        ;(params.api as any).setGridOption?.('groupIncludeTotalFooter', true)
        ;(params.api as any).setGridOption?.('suppressAggFuncInHeader', false)
        console.log('✅ Pivot mode forced via multiple methods')
        
        // Use the params.api directly instead of waiting for gridApi state
        setTimeout(() => {
          console.log('🔧 Setting up pivot with params.api directly...')
          console.log('🔧 Data at setup time:', data?.length, data?.[0])
          
          if (!data || data.length === 0) {
            console.log('❌ No data for pivot setup')
            return
          }
          
          const first = data[0]
          const keys = Object.keys(first)
          console.log('📊 Available keys:', keys)
          
          // Detect field types
          const numericSet = new Set<string>()
          const nonNumeric: string[] = []
          const sample = data.slice(0, 50)
          keys.forEach((k) => {
            const vals = sample.map((r: any) => r?.[k]).filter((v: any) => v !== null && v !== undefined && v !== '')
            const nums = vals.filter((v: any) => !isNaN(Number(v)))
            if (vals.length > 0 && nums.length >= Math.max(1, Math.floor(vals.length * 0.6))) {
              numericSet.add(k)
            } else {
              nonNumeric.push(k)
            }
          })
          
          const hasAy = keys.includes('Ay') || keys.includes('AyAdi')
          const hasTarihGun = keys.includes('TarihGun') || keys.includes('Tarih') || keys.includes('Gun')
          const hasDesc = keys.includes('DESCRIPTION') || keys.includes('Desc') || keys.includes('Açıklama')
          const hasAdet = keys.includes('Adet')
          
          console.log('🔍 Field detection:', { hasAy, hasTarihGun, hasDesc, hasAdet })
          
          // Set grid options for pivot mode
          try {
            ;(params.api as any).setGridOption?.('pivotMode', true)
            ;(params.api as any).setGridOption?.('groupDisplayType', 'groupRows')
            ;(params.api as any).setGridOption?.('groupDefaultExpanded', -1)
            ;(params.api as any).setGridOption?.('groupIncludeFooter', true)
            ;(params.api as any).setGridOption?.('groupIncludeTotalFooter', true)
            ;(params.api as any).setGridOption?.('suppressAggFuncInHeader', false)
            console.log('✅ Pivot grid options set')
          } catch (e) {
            console.warn('Pivot grid options error:', e as Error)
          }
          
          // Get current column state
          const current = params.api.getColumnState ? params.api.getColumnState() : []
          const state = current.map((c: any) => ({ ...c }))
          
          // Clear existing groups and values
          state.forEach((c: any) => {
            c.rowGroup = false
            c.rowGroupIndex = undefined
            c.value = false
            c.aggFunc = undefined
            c.pivot = false
            c.pivotIndex = undefined
          })
          
          // Set row groups: Ay > TarihGun
          const orderCandidates: string[] = []
          if (hasAy) orderCandidates.push(keys.includes('Ay') ? 'Ay' : 'AyAdi')
          if (hasTarihGun) orderCandidates.push(keys.includes('TarihGun') ? 'TarihGun' : (keys.includes('Tarih') ? 'Tarih' : 'Gun'))
          
          console.log('🔧 Setting row groups:', orderCandidates)
          orderCandidates.forEach((g, idx) => {
            state.forEach((c: any) => {
              if (c.colId === g) {
                c.rowGroup = true
                c.rowGroupIndex = idx
                console.log(`✅ Set ${g} as row group ${idx}`)
              }
            })
          })
          
          // Set value: Adet or first numeric
          const valueField = hasAdet ? 'Adet' : Array.from(numericSet)[0]
          if (valueField) {
            state.forEach((c: any) => {
              if (c.colId === valueField) {
                c.value = true
                c.aggFunc = 'sum'
                console.log(`✅ Set ${valueField} as value with sum`)
              }
            })
          }
          
          // Set pivot: DESCRIPTION
          if (hasDesc) {
            const descField = keys.includes('DESCRIPTION') ? 'DESCRIPTION' : (keys.includes('Desc') ? 'Desc' : 'Açıklama')
            state.forEach((c: any) => {
              if (c.colId === descField) {
                c.pivot = true
                c.pivotIndex = 0
                console.log(`✅ Set ${descField} as pivot column`)
              }
            })
          }
          
          // Apply the state
          console.log('🔧 Applying pivot state:', state)
          if (params.api.applyColumnState) {
            params.api.applyColumnState({ state, applyOrder: true })
          }
          
          // Refresh the grid to show pivot data
          setTimeout(() => {
            try {
              ;(params.api as any).refreshClientSideRowModel?.('group')
              ;(params.api as any).expandAll?.()
              console.log('✅ Pivot refresh and expand completed')
              
              // Check if pivot actually worked
              setTimeout(() => {
                try {
                  const rowCount = (params.api as any).getDisplayedRowCount?.()
                  console.log('🔍 Pivot row count after setup:', rowCount)
                  
                  if (rowCount === 0) {
                    console.warn('⚠️ Pivot produced zero rows - AG Grid pivot module not available')
                    // Instead of falling back, show a message that pivot is not available
                    alert('Pivot özelliği için AG Grid Enterprise gerekli. Lütfen Grid görünümünü kullanın.')
                  }
                } catch (e) {
                  console.warn('Pivot row count check error:', e as Error)
                }
              }, 200)
            } catch (e) {
              console.warn('Pivot refresh error:', e as Error)
            }
          }, 100)
        }, 1000)
      } catch (e) { console.warn('Force pivot apply error:', e as Error) }
    }
    
    // Load saved settings after grid is ready - Direct implementation
    setTimeout(() => {
      console.log('🔄 onGridReady: Loading settings with APIs directly')
      if (user?.id && gridType) {
        try {
          const storageKey = `grid-settings-${user.id}-${user.companyId || 'no-company'}-${gridType}`
          console.log('🔍 Direct load - Storage key:', storageKey)
          
          const localSettings = localStorage.getItem(storageKey)
          console.log('📦 Direct load - localStorage data:', localSettings ? 'FOUND' : 'NOT FOUND')
          
          if (localSettings && params.api && !params.api.isDestroyed?.()) {
            const settings = JSON.parse(localSettings)
            console.log('✅ Direct load - Parsed settings keys:', Object.keys(settings))
            
            if (settings.columnSettings) {
              console.log('📊 Direct load - Applying column settings')
              try {
              if (params.api.applyColumnState) {
                params.api.applyColumnState({ state: settings.columnSettings, applyOrder: true })
                } else if (params.columnApi && params.columnApi.applyColumnState) {
                params.columnApi.applyColumnState({ state: settings.columnSettings, applyOrder: true })
                }
              } catch (error) {
                console.warn('⚠️ Column settings error:', error)
              }
            }
            
            if (settings.filterSettings) {
              console.log('🔍 Direct load - Applying filter settings')
              try {
              params.api.setFilterModel(settings.filterSettings)
              } catch (error) {
                console.warn('⚠️ Filter settings error:', error)
              }
            }
            
            if (settings.sortSettings && (params.api as any).setSortModel) {
              console.log('↕️ Direct load - Applying sort settings')
              try {
              ;(params.api as any).setSortModel(settings.sortSettings)
              } catch (error) {
                console.warn('⚠️ Sort settings error:', error)
              }
            }
            
            if (settings.sidebarSettings?.visible && params.api.setSideBarVisible) {
              console.log('📋 Direct load - Applying sidebar settings')
              try {
              params.api.setSideBarVisible(settings.sidebarSettings.visible)
              setSidebarVisible(settings.sidebarSettings.visible)
              } catch (error) {
                console.warn('⚠️ Sidebar settings error:', error)
              }
            }
            
            if (settings.themeSettings?.theme) {
              console.log('🎨 Direct load - Applying theme settings:', settings.themeSettings.theme)
              setCurrentTheme(settings.themeSettings.theme)
            }

            if (typeof settings.pivotMode === 'boolean') {
              try {
                setPivotMode(!!settings.pivotMode)
                if ((params.api as any).setPivotMode) {
                  ;(params.api as any).setPivotMode(!!settings.pivotMode)
                }
                if (settings.pivotMode) ensurePivotDefaults()
              } catch (error) {
                console.warn('⚠️ Direct load - Pivot mode error:', error)
              }
            }
            
            console.log('✅ Direct load - Grid ayarları başarıyla yüklendi!')
          } else {
            console.log('ℹ️ Direct load - Kaydedilmiş ayar bulunamadı veya grid destroyed')
          }
        } catch (error) {
          console.error('❌ Direct load - Grid ayarları yüklenirken hata:', error)
        }
      } else {
        console.log('⚠️ Direct load - User ID veya gridType eksik:', { userId: user?.id, gridType })
      }
    }, 800)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimer) {
        clearTimeout(resizeTimer)
    }
    }
  }, [user?.id, gridType, forcePivot])

  // Sidebar functions
  const toggleSidebar = useCallback(() => {
    // Sidebar is not available in community edition
    console.log('Sidebar is not available in community edition')
  }, [gridApi])

  // Compact save to SQL (short keys to reduce payload size)
  const saveGridSettingsSQL = useCallback(async () => {
    if (authLoading) {
      alert('⏳ Kullanıcı bilgileri yükleniyor, lütfen bekleyin...')
      return
    }
    if (!gridApi || !gridColumnApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }
    if (!user?.id) {
      alert('❌ Giriş yapmalısınız!')
      return
    }
    if (!gridType) {
      alert('❌ Grid tipi tanımlı değil!')
      return
    }

    try {
      const raw = gridApi.getColumnState ? gridApi.getColumnState() : gridColumnApi.getColumnState()
      const col = (raw || []).map((c: any) => {
        const o: any = { id: c.colId }
        if (c.hide === true) o.h = 1
        if (c.pinned) o.p = c.pinned
        if (c.sort) o.s = c.sort
        if (typeof c.sortIndex === 'number') o.si = c.sortIndex
        if (typeof c.width === 'number') o.w = c.width
        if (typeof c.flex === 'number') o.f = c.flex
        if (c.rowGroup) o.rg = 1
        if (typeof c.rowGroupIndex === 'number') o.rgi = c.rowGroupIndex
        if (c.pivot) o.pv = 1
        if (typeof c.pivotIndex === 'number') o.pvi = c.pivotIndex
        if (c.aggFunc) o.a = c.aggFunc
        if ((c as any).value) o.v = 1
        return o
      })

      const fm = gridApi.getFilterModel ? gridApi.getFilterModel() : {}
      const sm = (gridApi as any).getSortModel ? (gridApi as any).getSortModel() : []
      const pv = (gridApi as any).isPivotMode ? !!(gridApi as any).isPivotMode() : pivotMode
      const sb = gridApi.isSideBarVisible ? !!gridApi.isSideBarVisible() : false

      const payload = {
        userId: user.id,
        gridType,
        columnSettings: col,
        filterSettings: fm,
        sortSettings: sm,
        sidebarSettings: { v: sb },
        viewPreferences: { t: currentTheme, pv },
        companyId: user.companyId || null
      }

      const res = await fetch('/api/user-grid-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const txt = await res.text()
        console.warn('SQL save error:', txt)
        alert('❌ SQL kaydı başarısız!')
        return
      }
      alert('✅ Grid ayarları başarıyla kaydedildi!')
    } catch (e) {
      console.warn('SQL save exception:', e)
      alert('❌ SQL kaydı sırasında hata oluştu!')
    }
  }, [authLoading, gridApi, gridColumnApi, user?.id, user?.companyId, gridType, currentTheme, pivotMode])


  // Save grid settings to database and localStorage
  const saveGridSettings = useCallback(async (opts?: { silent?: boolean }) => {
    console.log('=== SAVE GRID SETTINGS DEBUG ===')
    console.log('authLoading:', authLoading)
    console.log('gridApi:', !!gridApi)
    console.log('gridColumnApi:', !!gridColumnApi)
    console.log('user:', user)
    console.log('gridType:', gridType)

    if (authLoading) {
      console.log('ERROR: Auth loading')
      alert('⏳ Kullanıcı bilgileri yükleniyor, lütfen bekleyin...')
      return
    }

    if (!gridApi || !gridColumnApi || gridApi.isDestroyed?.()) {
      console.log('ERROR: Grid not ready or destroyed')
      alert('❌ Grid hazır değil!')
      return
    }

    if (!user?.id) {
      console.log('ERROR: No user ID')
      alert('❌ Grid ayarları kaydetmek için giriş yapmalısınız!')
      return
    }

    if (!gridType) {
      console.log('ERROR: No gridType')
      alert('❌ Grid tipi tanımlanmamış!')
      return
    }

    try {
      console.log('✓ Getting grid state...')
      
      // Get current grid state - Fixed for AG-Grid v31+
      let columnState: any[] = []
      let filterModel: any = {}
      let sortModel: any[] = []
      let currentPivotMode = pivotMode
      
      try {
        if (gridApi && !gridApi.isDestroyed?.()) {
          const rawColumnState = gridApi.getColumnState ? gridApi.getColumnState() : gridColumnApi.getColumnState()
          console.log('Raw column state length:', rawColumnState?.length)
          
          // Clean column state to remove any DOM elements or circular references
          columnState = rawColumnState?.map((col: any) => ({
            colId: col.colId,
            hide: col.hide,
            pinned: col.pinned,
            sort: col.sort,
            sortIndex: col.sortIndex,
            width: col.width,
            flex: col.flex,
            rowGroup: col.rowGroup,
            rowGroupIndex: col.rowGroupIndex,
            pivot: col.pivot,
            pivotIndex: col.pivotIndex,
            aggFunc: col.aggFunc,
            value: (col as any).value
          })) || []
          console.log('Cleaned column state length:', columnState.length)
          
          filterModel = gridApi.getFilterModel() || {}
      console.log('Filter model keys:', Object.keys(filterModel || {}))
      
          if ((gridApi as any).getSortModel) {
            sortModel = (gridApi as any).getSortModel() || []
            console.log('Sort model length:', sortModel.length)
          }

          try {
            if ((gridApi as any).isPivotMode) {
              currentPivotMode = !!(gridApi as any).isPivotMode()
            }
          } catch {}
        }
      } catch (error) {
        console.warn('⚠️ Error getting grid state:', error)
      }
      
      const sidebarState = gridApi && !gridApi.isDestroyed?.() && gridApi.isSideBarVisible ? gridApi.isSideBarVisible() : false
      console.log('Sidebar visible:', sidebarState)
      
      const settings = {
        columnSettings: columnState,
        filterSettings: filterModel,
        sortSettings: sortModel,
        pivotMode: currentPivotMode,
        sidebarSettings: {
          visible: sidebarState
        },
        themeSettings: {
          theme: currentTheme
        }
      }

      console.log('✓ Settings object created, stringifying...')
      const settingsString = JSON.stringify(settings)
      console.log('Settings string length:', settingsString.length)

      // Save to localStorage as fallback
      const storageKey = `grid-settings-${user.id}-${user.companyId || 'no-company'}-${gridType}`
      console.log('✓ Saving to localStorage key:', storageKey)
      
      localStorage.setItem(storageKey, settingsString)
      console.log('✓ localStorage save completed')
      
      if (!opts?.silent) {
      alert('✅ Grid ayarları başarıyla kaydedildi!')
      }

      // Also try to save to database (optional)
      // Eski buton davranışı: localStorage öncelikli, DB opsiyonel kaldırıldı
    } catch (error) {
      console.error('❌ CRITICAL ERROR in saveGridSettings:', error)
      if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      }
      alert('❌ Grid ayarları kaydedilirken beklenmeyen hata oluştu! Konsolu kontrol edin.')
    }
  }, [gridApi, gridColumnApi, user?.id, gridType, authLoading, currentTheme])


  // Auto-size columns to fit content
  const autoSizeColumns = useCallback(() => {
    if (!gridApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }

    try {
      console.log('📏 Sütunları içeriğe göre boyutlandırılıyor...')
      
      // Get all columns
        const allColumns = gridApi.getColumns?.() || (gridColumnApi?.getAllColumns?.() || [])
      if (allColumns && allColumns.length > 0) {
        console.log(`📊 Found ${allColumns.length} columns to resize`)
        
        // Method 1: Try AG-Grid's built-in autoSizeColumns
        if ((gridApi as any).autoSizeColumns) {
          console.log('🔧 Using gridApi.autoSizeColumns()')
          ;(gridApi as any).autoSizeColumns()
        } else if (gridColumnApi && (gridColumnApi as any).autoSizeColumns) {
          console.log('🔧 Using gridColumnApi.autoSizeColumns()')
          ;(gridColumnApi as any).autoSizeColumns()
        } else {
          console.log('🔧 Using manual column sizing')
          // Method 2: Manual auto-sizing based on content
          allColumns.forEach((column: any) => {
            try {
            const colDef = column.getColDef ? column.getColDef() : column.colDef
              const field = colDef.field
              const headerName = colDef.headerName || field || 'Unknown'
              
              if (!field) return
              
              // Get sample data to calculate content width
              const sampleData = data?.slice(0, 20) || [] // Check first 20 rows
              let maxWidth = headerName.length * 8 + 20 // Start with header width
              
              sampleData.forEach(row => {
                const cellValue = row[field]
                if (cellValue !== null && cellValue !== undefined) {
                  const valueStr = String(cellValue)
                  const valueWidth = valueStr.length * 8 + 20
                  maxWidth = Math.max(maxWidth, valueWidth)
                }
              })
              
              // Apply constraints
              const finalWidth = Math.min(400, Math.max(80, maxWidth))
              
              console.log(`📏 Column ${headerName}: content width ${maxWidth}, final width ${finalWidth}`)
              if (gridApi && !gridApi.isDestroyed?.()) {
                if (gridApi.setColumnWidth) {
                  gridApi.setColumnWidth(column, finalWidth)
                } else if (gridColumnApi?.setColumnWidth) {
                  gridColumnApi.setColumnWidth(column, finalWidth)
                }
              }
            } catch (columnError) {
              console.warn('⚠️ Column sizing error:', columnError)
            }
          })
        }
        
        console.log('✅ Sütun boyutları yazıya göre ayarlandı!')
        
        // Otomatik olarak ayarları kaydet (sessiz)
        setTimeout(() => {
          if (gridApi && !gridApi.isDestroyed?.()) {
          console.log('💾 Sütun boyutlandırma sonrası otomatik kaydetme...')
            saveGridSettings({ silent: true })
          }
        }, 500)
        
        alert('✅ Sütunlar yazıya göre boyutlandırıldı ve kaydedildi!')
      } else {
        console.log('❌ Hiç sütun bulunamadı')
        alert('❌ Boyutlandırılacak sütun bulunamadı!')
      }
      
    } catch (error) {
      console.error('❌ Sütun boyutlandırma hatası:', error)
      alert('❌ Sütun boyutlandırma sırasında hata oluştu!')
    }
  }, [gridApi, gridColumnApi, saveGridSettings, data])

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!gridApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }

    try {
      console.log('📤 CSV export başlatılıyor...')
      const params = {
        fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ',',
        suppressQuotes: false,
        allColumns: false,
        onlySelected: false,
        onlySelectedAllPages: false,
        skipHeader: false,
        skipFooters: false,
        skipGroups: false,
        skipPinnedTop: false,
        skipPinnedBottom: false
      }
      
      if (gridApi && !gridApi.isDestroyed?.()) {
      gridApi.exportDataAsCsv(params)
      console.log('✅ CSV export tamamlandı')
      }
    } catch (error) {
      console.error('❌ CSV export hatası:', error)
      alert('❌ CSV dışarı aktarma sırasında hata oluştu!')
    }
  }, [gridApi, title])

  const exportToExcel = useCallback(() => {
    if (!gridApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }

    try {
      console.log('📤 Excel export başlatılıyor...')
      const params = {
        fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: title.substring(0, 31), // Excel sheet name limit
        author: 'Pinebi Report',
        allColumns: false,
        onlySelected: false,
        onlySelectedAllPages: false,
        skipHeader: false,
        skipFooters: false,
        skipGroups: false,
        skipPinnedTop: false,
        skipPinnedBottom: false,
      }
      
      if (gridApi && !gridApi.isDestroyed?.() && gridApi.exportDataAsExcel) {
        gridApi.exportDataAsExcel(params)
        console.log('✅ Excel export tamamlandı')
      } else {
        // Fallback to CSV if Excel export is not available
        console.log('⚠️ Excel export mevcut değil, CSV\'ye dönülüyor')
        exportToCSV()
      }
    } catch (error) {
      console.error('❌ Excel export hatası:', error)
      alert('❌ Excel dışarı aktarma sırasında hata oluştu!')
    }
  }, [gridApi, title, exportToCSV])

  const printGrid = useCallback(() => {
    if (!gridApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }

    try {
      console.log('🖨️ Print başlatılıyor...')
      
      // Get all visible columns and data
      const columns = gridApi.getColumns()
      const allRowData: any[] = []
      gridApi.forEachNode((node) => {
        if (node.data) {
          allRowData.push(node.data)
        }
      })

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        alert('❌ Yazdırma penceresi açılamadı! Popup engelleyicisini kontrol edin.')
        return
      }

      // Generate HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} - Yazdırma</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 { 
              margin: 0; 
              color: #333; 
              font-size: 18px;
            }
            .header .date { 
              margin: 5px 0 0 0; 
              color: #666; 
              font-size: 11px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              text-align: left;
              font-size: 11px;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
              text-align: center;
            }
            .numeric { 
              text-align: right; 
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="date">Yazdırma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
          </div>
          <table>
            <thead>
              <tr>
      `

      // Add headers
      if (columns) {
        columns.forEach(column => {
          const colDef = column.getColDef()
          if (colDef.headerName && !colDef.hide) {
            htmlContent += `<th>${colDef.headerName}</th>`
          }
        })
      }

      htmlContent += `
              </tr>
            </thead>
            <tbody>
      `

      // Add data rows
      allRowData.forEach(rowData => {
        htmlContent += '<tr>'
        if (columns) {
          columns.forEach(column => {
            const colDef = column.getColDef()
            if (colDef.field && !colDef.hide) {
              const value = rowData[colDef.field] || ''
              const isNumeric = !isNaN(Number(value)) && value !== ''
              const cellClass = isNumeric ? 'numeric' : ''
              htmlContent += `<td class="${cellClass}">${value}</td>`
            }
          })
        }
        htmlContent += '</tr>'
      })

      htmlContent += `
            </tbody>
          </table>
          <div class="footer">
            <div>Pinebi Report - ${title}</div>
            <div>Toplam ${allRowData.length} kayıt</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              // Close the window after printing (optional)
              // setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      console.log('✅ Print penceresi hazırlandı')
    } catch (error) {
      console.error('❌ Print hatası:', error)
      alert('❌ Yazdırma sırasında hata oluştu!')
    }
  }, [gridApi, title])

  // Ensure default pivot configuration so data is visible when pivot opens
  const ensurePivotDefaults = useCallback(() => {
    try {
      if (!gridApi || gridApi.isDestroyed?.()) {
        console.log('❌ Grid API not ready or destroyed')
        return
      }
      const colApi = gridColumnApi || (gridApi as any).getColumnApi?.()
      const current = gridApi.getColumnState ? gridApi.getColumnState() : colApi?.getColumnState?.()
      const hasValues = (current || []).some((c: any) => c.value || c.aggFunc)
      const hasGroups = (current || []).some((c: any) => c.rowGroup)
      
      console.log('🔧 ensurePivotDefaults called:', { hasValues, hasGroups, dataLength: data?.length, forcePivot })

      // Infer from data
      const first = data && data.length > 0 ? data[0] : null
      if (!first) {
        console.log('❌ No data for pivot defaults, data:', data)
        return
      }
      const keys = Object.keys(first)
      console.log('📊 Available keys:', keys)
      
      const numericSet = new Set<string>()
      const nonNumeric: string[] = []
      // sample first 50 rows
      const sample = (data || []).slice(0, 50)
      keys.forEach((k) => {
        const vals = sample.map((r: any) => r?.[k]).filter((v: any) => v !== null && v !== undefined && v !== '')
        const nums = vals.filter((v: any) => !isNaN(Number(v)))
        if (vals.length > 0 && nums.length >= Math.max(1, Math.floor(vals.length * 0.6))) {
          numericSet.add(k)
        } else {
          nonNumeric.push(k)
        }
      })
      console.log('📊 Numeric fields:', Array.from(numericSet))
      console.log('📊 Non-numeric fields:', nonNumeric)

      const state = (current || []).map((c: any) => ({ ...c }))
      const hasAy = keys.includes('Ay') || keys.includes('AyAdi')
      const hasTarihGun = keys.includes('TarihGun') || keys.includes('Tarih') || keys.includes('Gun')
      const hasDesc = keys.includes('DESCRIPTION') || keys.includes('Desc') || keys.includes('Açıklama')
      const hasAdet = keys.includes('Adet')
      
      console.log('🔍 Field detection:', { hasAy, hasTarihGun, hasDesc, hasAdet })
      
      let applied = false
      
      // Always apply preferred layout for forced pivot
      if (forcePivot) {
        // Clear existing groups and values
        state.forEach((c: any) => {
          c.rowGroup = false
          c.rowGroupIndex = undefined
          c.value = false
          c.aggFunc = undefined
          c.pivot = false
          c.pivotIndex = undefined
        })
        
        // Set row groups: Ay > TarihGun
        const orderCandidates: string[] = []
        if (hasAy) orderCandidates.push(keys.includes('Ay') ? 'Ay' : 'AyAdi')
        if (hasTarihGun) orderCandidates.push(keys.includes('TarihGun') ? 'TarihGun' : (keys.includes('Tarih') ? 'Tarih' : 'Gun'))
        
        console.log('🔧 Setting row groups:', orderCandidates)
        orderCandidates.forEach((g, idx) => {
          state.forEach((c: any) => {
            if (c.colId === g) {
              c.rowGroup = true
              c.rowGroupIndex = idx
              applied = true
              console.log(`✅ Set ${g} as row group ${idx}`)
            }
          })
        })
        
        // Set value: Adet or first numeric
        const valueField = hasAdet ? 'Adet' : Array.from(numericSet)[0]
        if (valueField) {
          state.forEach((c: any) => {
            if (c.colId === valueField) {
              c.value = true
              c.aggFunc = 'sum'
              applied = true
              console.log(`✅ Set ${valueField} as value with sum`)
            }
          })
        }
        
        // Set pivot: DESCRIPTION
        if (hasDesc) {
          const descField = keys.includes('DESCRIPTION') ? 'DESCRIPTION' : (keys.includes('Desc') ? 'Desc' : 'Açıklama')
          state.forEach((c: any) => {
            if (c.colId === descField) {
              c.pivot = true
              c.pivotIndex = 0
              applied = true
              console.log(`✅ Set ${descField} as pivot column`)
            }
          })
        }
      } else {
        // Original logic for non-forced pivot
        if (!hasGroups) {
          const orderCandidates: string[] = []
          if (hasAy) orderCandidates.push(keys.includes('Ay') ? 'Ay' : 'AyAdi')
          if (hasTarihGun) orderCandidates.push(keys.includes('TarihGun') ? 'TarihGun' : (keys.includes('Tarih') ? 'Tarih' : 'Gun'))
          if (orderCandidates.length === 0 && nonNumeric.length > 0) orderCandidates.push(nonNumeric[0])
          orderCandidates.forEach((g, idx) => {
            state.forEach((c: any) => {
              if (c.colId === g) {
                c.rowGroup = true
                c.rowGroupIndex = idx
                applied = true
              }
            })
          })
        }
        if (!hasValues) {
          const valueField = hasAdet ? 'Adet' : Array.from(numericSet)[0]
          if (valueField) {
            state.forEach((c: any) => {
              if (c.colId === valueField) {
                c.value = true
                c.aggFunc = c.aggFunc || 'sum'
                applied = true
              }
            })
          }
        }
        if (hasDesc) {
          const descField = keys.includes('DESCRIPTION') ? 'DESCRIPTION' : (keys.includes('Desc') ? 'Desc' : 'Açıklama')
          state.forEach((c: any) => {
            if (c.colId === descField) {
              c.pivot = true
              c.pivotIndex = 0
              applied = true
            }
          })
        }
      }

      if (applied) {
        console.log('🔧 Applying pivot state:', state)
        if (gridApi.applyColumnState) {
          gridApi.applyColumnState({ state, applyOrder: true })
        } else if (gridColumnApi?.applyColumnState) {
          gridColumnApi.applyColumnState({ state, applyOrder: true })
        }
        // autosave
        setTimeout(() => { if (!gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)
      }
    } catch (e) {
      console.warn('ensurePivotDefaults error:', e)
    }
  }, [gridApi, gridColumnApi, data, saveGridSettings, forcePivot])

  const resetGridSettings = useCallback(async () => {
    if (!gridApi || gridApi.isDestroyed?.()) {
      alert('❌ Grid hazır değil!')
      return
    }

    try {
      // Reset grid state
      if (gridApi && !gridApi.isDestroyed?.()) {
      gridApi.setFilterModel({})
        if ((gridApi as any).setSortModel) {
          ;(gridApi as any).setSortModel([])
      }
      
      // Reset sidebar
      if (gridApi.setSideBarVisible) {
        gridApi.setSideBarVisible(false)
        setSidebarVisible(false)
        }
      }

      // Clear localStorage
      if (user?.id && gridType) {
        const storageKey = `grid-settings-${user.id}-${user.companyId || 'no-company'}-${gridType}`
        localStorage.removeItem(storageKey)
        
        // Also try to delete from database
        try {
          const response = await fetch('/api/user-grid-settings', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, gridType })
          })
          
          if (response.ok) {
            console.log('✅ Database ayarları da silindi')
          }
        } catch (dbError) {
          console.log('⚠️ Database silme hatası:', dbError)
        }
      }
      
      alert('✅ Grid ayarları sıfırlandı!')
    } catch (error) {
      console.error('Reset error:', error)
      alert('❌ Grid ayarları sıfırlanırken hata oluştu!')
    }
  }, [gridApi, user?.id, gridType])

  // Sidebar removed - not available in community edition
  // const sideBar: SideBarDef = useMemo(() => ({ ... }), [])

  // Enhanced column definitions with automatic numeric detection
  const enhancedColumnDefs = useMemo((): ColDef[] => {
    console.log('🔍 enhancedColumnDefs called:', {
      dataLength: data?.length,
      columnDefsLength: columnDefs?.length,
      columnDefs: columnDefs
    })
    
    if (!data || data.length === 0) {
      console.log('❌ No data, returning original columnDefs')
      return columnDefs
    }

    if (!columnDefs || columnDefs.length === 0) {
      console.log('❌ No columnDefs, returning empty array')
      return []
    }

    console.log('✅ Processing columnDefs:', columnDefs)
    return columnDefs.map(colDef => {
      const field = colDef.field
      if (!field) return colDef

      // Check if column contains numeric data
      const sampleValues = data.slice(0, 10).map(row => row[field])
      const numericValues = sampleValues.filter(val => 
        val !== null && val !== undefined && val !== '' && !isNaN(Number(val))
      )
      
      const isNumericColumn = numericValues.length > sampleValues.length * 0.7 // 70% numeric

      if (isNumericColumn) {
        return {
          ...colDef,
          type: 'numericColumn',
          // Community number filter
          filter: 'agNumberColumnFilter',
          headerComponent: 'multiSelectHeader' as any,
          headerComponentParams: {
            field,
            getValues: () => Array.from(new Set(data.map((r: any) => r[field]))).filter(v => v !== undefined && v !== null && v !== ''),
            onChange: (selected: any[]) => {
              setMultiSelectFilters(prev => {
                const next = { ...prev }
                if (selected.length === 0) {
                  delete next[field]
                } else {
                  next[field] = new Set(selected)
                }
                // trigger external filter
                if (gridApi && !gridApi.isDestroyed?.()) gridApi.onFilterChanged()
                return next
              })
            },
            getSelected: () => Array.from(multiSelectFilters[field] || [])
          } as any,
          cellStyle: {
            textAlign: 'center',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } as any,
          headerClass: 'ag-header-center',
          cellClass: 'ag-cell-center ag-cell-numeric',
          valueFormatter: (params: any) => {
            if (params.value == null || params.value === '') return ''
            return new Intl.NumberFormat('tr-TR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(Number(params.value))
          }
        }
      }

      return {
        ...colDef,
        // Community text filter with contains by default
        filter: 'agTextColumnFilter',
        headerComponent: 'multiSelectHeader' as any,
        headerComponentParams: {
          field,
          getValues: () => Array.from(new Set(data.map((r: any) => r[field]))).filter(v => v !== undefined && v !== null && v !== ''),
          onChange: (selected: any[]) => {
            setMultiSelectFilters(prev => {
              const next = { ...prev }
              if (selected.length === 0) {
                delete next[field]
              } else {
                next[field] = new Set(selected)
              }
              if (gridApi && !gridApi.isDestroyed?.()) gridApi.onFilterChanged()
              return next
            })
          },
          getSelected: () => Array.from(multiSelectFilters[field] || [])
        } as any,
        cellStyle: {
          textAlign: 'left',
          paddingLeft: '12px'
        } as any,
        headerClass: 'ag-header-left'
      }
    })
  }, [columnDefs, data, gridApi, multiSelectFilters])

  // Theme configurations
  const themeColors = useMemo(() => {
    const themes = {
      default: { oddRow: '#f8fafc', evenRow: '#ffffff', hover: '#e0f2fe' },
      blue: { oddRow: '#eff6ff', evenRow: '#ffffff', hover: '#bfdbfe' },
      green: { oddRow: '#f0fdf4', evenRow: '#ffffff', hover: '#bbf7d0' },
      purple: { oddRow: '#faf5ff', evenRow: '#ffffff', hover: '#e9d5ff' },
      orange: { oddRow: '#fff7ed', evenRow: '#ffffff', hover: '#fdba74' }
    }
    return themes[currentTheme] || themes.default
  }, [currentTheme])

  const getRowStyle = useCallback((params: any) => {
    // Highlight processed rows in red if provided by data
    if (params?.data && (params.data.__invoiceProcessed === true || params.data.faturasiIslendi === true)) {
      return {
        backgroundColor: '#fee2e2', // Light red background
        color: '#dc2626', // Red text
        fontWeight: 'bold' as const,
        borderTop: 'none'
      }
    }
    if (params.node.rowPinned === 'bottom') {
      return {
        fontWeight: 'bold' as const,
        backgroundColor: themeColors.hover,
        borderTop: '2px solid #cbd5e1',
        color: '#1e293b'
      }
    }
    
    if (params.node.rowIndex % 2 === 0) {
      return { 
        backgroundColor: themeColors.evenRow,
        fontWeight: 'normal' as const,
        borderTop: 'none',
        color: 'inherit'
      }
    } else {
      return { 
        backgroundColor: themeColors.oddRow,
        fontWeight: 'normal' as const,
        borderTop: 'none',
        color: 'inherit'
      }
    }
  }, [themeColors])

  const defaultColDef: ColDef = useMemo(() => ({
    sortable: true,
    // Use community filters by default; per-column overrides below
    filter: true as any,
    resizable: true,
    minWidth: 100,
    maxWidth: 300,
    floatingFilter: true,
    suppressAutoSize: false,
    wrapText: false,
    autoHeight: false
  }), [])

  // Simple header component with checkbox multi-select for Community edition
  function MultiSelectHeader(props: any) {
    const { displayName, field } = props
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [coords, setCoords] = useState<{top: number, left: number, width: number}>({ top: 0, left: 0, width: 240 })
    const values: any[] = (props.getValues?.() || []).filter((v: any) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
    const selected: any[] = props.getSelected?.() || []
    const containerRef = useState<HTMLElement | null>(null)[0]
    const toggle = (val: any) => {
      const next = new Set(selected)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      props.onChange?.(Array.from(next))
    }
    const clearAll = () => props.onChange?.([])
    const selectAll = () => props.onChange?.(props.getValues?.() || [])
    const updateCoords = (el: HTMLElement | null) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCoords({ top: rect.bottom + 4, left: rect.left, width: Math.max(240, rect.width) })
    }
    useEffect(() => {
      const onScrollOrResize = () => {
        const el = document.getElementById(`hdr-${field}`)
        if (el) updateCoords(el)
      }
      window.addEventListener('scroll', onScrollOrResize, true)
      window.addEventListener('resize', onScrollOrResize)
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true)
        window.removeEventListener('resize', onScrollOrResize)
      }
    }, [field])
    const popup = (
      <div
        style={{ position: 'fixed', zIndex: 100000, top: coords.top, left: coords.left, width: coords.width, background: '#fff', border: '1px solid #e5e7eb', padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara..." className="border px-2 py-1 w-full" />
        </div>
        <div className="flex items-center gap-2 mb-2 text-xs">
          <button className="border px-2 py-1" onClick={selectAll}>Tümünü Seç</button>
          <button className="border px-2 py-1" onClick={clearAll}>Temizle</button>
          <button className="border px-2 py-1 ml-auto" onClick={() => setOpen(false)}>Kapat</button>
        </div>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {values.map((v: any) => (
            <label key={`${field}-${String(v)}`} className="flex items-center gap-2 text-sm py-1">
              <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} />
              <span>{String(v)}</span>
            </label>
          ))}
          {values.length === 0 && (
            <div className="text-xs text-gray-500">Değer yok</div>
          )}
        </div>
      </div>
    )
  return (
      <div id={`hdr-${field}`} style={{ position: 'relative' }}>
        <div
          className="ag-header-cell-label"
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); const el = document.getElementById(`hdr-${field}`); updateCoords(el) }}
          style={{ cursor: 'pointer' }}
        >
          <span className="ag-header-cell-text">{displayName || field}</span>
        </div>
        {open && createPortal(popup, document.body)}
      </div>
    )
  }

  // Register custom header component with AG Grid
  const componentsMap = useMemo(() => ({
    multiSelectHeader: MultiSelectHeader
  }), [])

  return (
    <>
      <style jsx global>{`
        /* AG-Grid dropdown z-index fix */
        .ag-popup {
          z-index: 9999 !important;
        }
        
        .ag-filter-toolpanel {
          z-index: 9999 !important;
          background: white !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .ag-filter-toolpanel-body {
          background: white !important;
        }
        
        .ag-filter-toolpanel-header {
          background: #f8f9fa !important;
          border-bottom: 1px solid #dee2e6 !important;
        }
        
        /* AG-Grid filter dropdown styling */
        .ag-filter-wrapper {
          z-index: 9999 !important;
        }
        
        .ag-filter-container {
          background: white !important;
          border: 1px solid #ddd !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Column menu styling */
        .ag-column-menu {
          z-index: 9999 !important;
          background: white !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .ag-column-menu-list {
          background: white !important;
        }
        
        /* Context menu styling */
        .ag-menu {
          z-index: 9999 !important;
          background: white !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .ag-menu-list {
          background: white !important;
        }
        
        /* Popup styling */
        .ag-popup-child {
          z-index: 9999 !important;
        }
        
        /* Ensure all AG-Grid overlays have proper z-index */
        .ag-overlay {
          z-index: 9999 !important;
        }
        
        .ag-overlay-wrapper {
          z-index: 9999 !important;
        }
      `}</style>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveGridSettings()}
              title="Grid Ayarlarını Kaydet"
              className="bg-green-50 border-green-200 hover:bg-green-100"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetGridSettings}
              title="Grid Ayarlarını Sıfırla"
              className="bg-red-50 border-red-200 hover:bg-red-100"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🔧 Auto-size button clicked!')
                autoSizeColumns()
              }}
              title="Sütunları Yazıya Göre Boyutlandır"
              className="bg-blue-50 border-blue-200 hover:bg-blue-100"
            >
              <Type className="w-4 h-4" />
            </Button>
            {/* Pivot toggle removed as requested */}

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={saveGridSettingsSQL}
                title="Firma+Kullanıcı Bazlı SQL Kaydet"
                className="bg-amber-50 border-amber-200 hover:bg-amber-100 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                <span>SQL Kaydet</span>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Palette className="w-4 h-4 text-gray-500" />
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value as any)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="default">Varsayılan</option>
                <option value="blue">Mavi</option>
                <option value="green">Yeşil</option>
                <option value="purple">Mor</option>
                <option value="orange">Turuncu</option>
              </select>
            </div>
            
            {/* Export and Print Buttons */}
            <div className="flex items-center gap-1 border-l pl-2 ml-1">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                title="CSV Olarak Dışarı Aktar"
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                title="Excel Olarak Dışarı Aktar"
                className="bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printGrid}
                title="Yazdır"
                className="bg-gray-50 border-gray-200 hover:bg-gray-100"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
            
            {onAdd && (
              <Button onClick={onAdd} size="sm">
                Ekle
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="ag-theme-alpine w-full" 
          style={{ 
            height: '70vh',
            '--ag-odd-row-background-color': themeColors.oddRow,
            '--ag-even-row-background-color': themeColors.evenRow,
            '--ag-row-hover-color': themeColors.hover,
            '--ag-header-background-color': '#f8fafc',
            '--ag-header-foreground-color': '#1f2937',
            '--ag-selected-row-background-color': '#dbeafe',
            '--ag-border-color': '#e5e7eb'
          } as React.CSSProperties}
        >
          <AgGridReact
            rowData={data}
            columnDefs={enhancedColumnDefs}
            defaultColDef={defaultColDef}
            rowModelType={'clientSide' as any}
            components={componentsMap as any}
            isExternalFilterPresent={() => {
              return Object.keys(multiSelectFilters).some(k => (multiSelectFilters[k] && multiSelectFilters[k].size > 0))
            }}
            doesExternalFilterPass={(node: any) => {
              if (!node?.data) return true
              for (const field in multiSelectFilters) {
                const set = multiSelectFilters[field]
                if (set && set.size > 0) {
                  const val = node.data[field]
                  if (!set.has(val)) return false
                }
              }
              return true
            }}
            onGridReady={onGridReady}
            {...(onCellClicked && { onCellClicked })}
            {...(onRowClicked && { onRowClicked })}
            animateRows={false}
            pagination={false}
            enableCellTextSelection={true}
            overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Veriler yükleniyor...</span>'}
            overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">Gösterilecek veri bulunmuyor</span>'}
            pinnedBottomRowData={calculateTotals ? [calculateTotals] : []}
            getRowStyle={getRowStyle}
            // sideBar removed - not available in community edition
            localeText={AG_GRID_LOCALE_TR}
            suppressContextMenu={false}
            enableBrowserTooltips={true}
            suppressRowClickSelection={false}
            rowSelection="multiple"
            rowMultiSelectWithClick={false}
            suppressRowDeselection={false}
            // Header settings
            headerHeight={40}
            suppressColumnVirtualisation={false}
            suppressHorizontalScroll={false}
            suppressColumnMoveAnimation={false}
            rowHeight={36}
            pivotMode={pivotMode}
            onColumnMoved={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
            onColumnPinned={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
            onColumnVisible={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
            onColumnRowGroupChanged={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
            onColumnPivotChanged={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
            onColumnValueChanged={() => setTimeout(() => { if (gridApi && !gridApi.isDestroyed?.()) { saveGridSettings({ silent: true }) } }, 200)}
          />
        </div>

      </CardContent>
    </Card>
    </>
  )
}
