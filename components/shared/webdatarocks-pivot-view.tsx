'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface WebDataRocksPivotViewProps {
  data: any[]
  title?: string
  gridKey: string
}

export default function WebDataRocksPivotView({ data, title = 'Pivot', gridKey }: WebDataRocksPivotViewProps) {
  const { user } = useAuth()
  const pivotRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedRowField, setSelectedRowField] = useState('Ay')
  const [selectedColField, setSelectedColField] = useState('DESCRIPTION')
  const [selectedValueField, setSelectedValueField] = useState('Adet')

  // Load WebDataRocks script
  useEffect(() => {
    const loadWebDataRocks = async () => {
      if (isLoaded) return

      try {
        // Load CSS
        if (!document.querySelector('link[href*="webdatarocks"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.webdatarocks.com/latest/webdatarocks.min.css'
          link.onload = () => console.log('WebDataRocks CSS loaded')
          link.onerror = () => console.error('WebDataRocks CSS failed to load')
          document.head.appendChild(link)
        }

        // Load JS with multiple CDN fallbacks
        if (!(window as any).WebDataRocks) {
          const tryLoadWebDataRocks = (url: string, attempt: number = 1) => {
            console.log(`🔄 Attempting to load WebDataRocks from ${url} (attempt ${attempt})`)
            
            const script = document.createElement('script')
            script.src = url
            script.onload = () => {
              console.log(`✅ WebDataRocks JS loaded successfully from ${url}`)
              // Wait a bit more for WebDataRocks to fully initialize
              setTimeout(() => {
                setIsLoaded(true)
              }, 500)
            }
            script.onerror = () => {
              console.error(`❌ WebDataRocks JS failed to load from ${url}`)
              
              // Try alternative CDN
              if (attempt === 1) {
                tryLoadWebDataRocks('https://unpkg.com/webdatarocks@latest/webdatarocks.min.js', 2)
              } else if (attempt === 2) {
                tryLoadWebDataRocks('https://cdn.jsdelivr.net/npm/webdatarocks@latest/webdatarocks.min.js', 3)
              } else {
                console.error('❌ All CDN attempts failed')
                setIsLoaded(true)
              }
            }
            document.head.appendChild(script)
          }
          
          // Start with primary CDN
          tryLoadWebDataRocks('https://cdn.webdatarocks.com/latest/webdatarocks.min.js')
          
          // Timeout fallback
          setTimeout(() => {
            if (!(window as any).WebDataRocks) {
              console.warn('⚠️ WebDataRocks load timeout, using fallback')
              setIsLoaded(true)
            }
          }, 20000)
        } else {
          console.log('✅ WebDataRocks already loaded')
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading WebDataRocks:', error)
        setIsLoaded(true)
      }
    }

    loadWebDataRocks()
  }, [isLoaded])

  // Initialize pivot table
  useEffect(() => {
    if (!isLoaded || !pivotRef.current || !data || data.length === 0) return

    try {
      // Check if WebDataRocks is available
      if (!(window as any).WebDataRocks) {
        console.warn('❌ WebDataRocks not available, showing loading message')
        
        // Show loading message instead of fallback
        pivotRef.current.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            margin: 20px;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007bff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            "></div>
            <h3 style="color: #495057; margin-bottom: 10px;">WebDataRocks Yükleniyor...</h3>
            <p style="color: #6c757d; text-align: center; max-width: 300px;">
              WebDataRocks pivot tablosu yükleniyor. Lütfen bekleyin...<br>
              Eğer bu mesaj uzun süre görünürse, sayfayı yenileyin.
            </p>
            <button onclick="window.location.reload()" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">Sayfayı Yenile</button>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `
        
        // Try to load WebDataRocks again with multiple CDNs
        setTimeout(() => {
          if (!(window as any).WebDataRocks) {
            console.log('🔄 Retrying WebDataRocks load with multiple CDNs...')
            
            const retryLoadWebDataRocks = (url: string, attempt: number = 1) => {
              const script = document.createElement('script')
              script.src = url
              script.onload = () => {
                console.log(`✅ WebDataRocks loaded on retry from ${url}`)
                // Force re-render
                window.location.reload()
              }
              script.onerror = () => {
                console.error(`❌ WebDataRocks retry failed from ${url}`)
                
                // Try alternative CDN
                if (attempt === 1) {
                  retryLoadWebDataRocks('https://unpkg.com/webdatarocks@latest/webdatarocks.min.js', 2)
                } else if (attempt === 2) {
                  retryLoadWebDataRocks('https://cdn.jsdelivr.net/npm/webdatarocks@latest/webdatarocks.min.js', 3)
                } else {
                  console.error('❌ All retry attempts failed')
                }
              }
              document.head.appendChild(script)
            }
            
            retryLoadWebDataRocks('https://cdn.webdatarocks.com/latest/webdatarocks.min.js')
          }
        }, 3000)
        
        return
      }

      console.log('🔧 Initializing WebDataRocks with data:', data.length, 'rows')
      
      const pivot = new (window as any).WebDataRocks({
        container: pivotRef.current,
        toolbar: true,
        report: {
          dataSource: {
            data: data
          },
          options: {
            grid: {
              showHeaders: true,
              showTotals: true,
              showGrandTotals: true,
              showFilter: true,
              showDrill: true
            }
          },
          slice: {
            rows: [
              { uniqueName: 'Ay' },
              { uniqueName: 'TarihGun' }
            ],
            columns: [
              { uniqueName: 'DESCRIPTION' }
            ],
            measures: [
              { uniqueName: 'Adet', aggregation: 'sum' }
            ]
          }
        }
      })

      // Disable double click events and add right click context menu
      setTimeout(() => {
        const container = pivotRef.current
        if (container) {
          // Add event listener to prevent double click
          container.addEventListener('dblclick', (e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
          }, true)
          
          // Add right click context menu for Excel export
          container.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            
            // Remove existing context menu if any
            const existingMenu = document.querySelector('.custom-context-menu')
            if (existingMenu) {
              existingMenu.remove()
            }
            
            // Create custom context menu
            const contextMenu = document.createElement('div')
            contextMenu.className = 'custom-context-menu'
            contextMenu.style.cssText = `
              position: fixed;
              top: ${e.clientY}px;
              left: ${e.clientX}px;
              background: white;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              z-index: 10000;
              min-width: 150px;
            `
            
            // Add Excel export option
            const excelOption = document.createElement('div')
            excelOption.style.cssText = `
              padding: 8px 12px;
              cursor: pointer;
              border-bottom: 1px solid #eee;
              display: flex;
              align-items: center;
              gap: 8px;
            `
            excelOption.innerHTML = `
              <span>📊</span>
              <span>Excel'e Aktar</span>
            `
            excelOption.onmouseover = () => {
              excelOption.style.backgroundColor = '#f5f5f5'
            }
            excelOption.onmouseout = () => {
              excelOption.style.backgroundColor = 'white'
            }
            excelOption.onclick = () => {
              try {
                // Try to use WebDataRocks export functionality
                if (pivot && typeof pivot.exportToExcel === 'function') {
                  pivot.exportToExcel()
                  console.log('✅ Excel export via WebDataRocks')
                } else if (pivot && typeof pivot.exportTo === 'function') {
                  pivot.exportTo('excel')
                  console.log('✅ Excel export via WebDataRocks exportTo')
                } else {
                  // Fallback: create CSV and download
                  const report = pivot.getReport()
                  const csvData = convertPivotToCSV(report)
                  downloadCSV(csvData, 'pivot-data.csv')
                  console.log('✅ Excel export via CSV fallback')
                }
              } catch (error) {
                console.error('❌ Excel export error:', error)
                alert('Excel aktarımında hata oluştu')
              }
              contextMenu.remove()
            }
            
            contextMenu.appendChild(excelOption)
            document.body.appendChild(contextMenu)
            
            // Close menu when clicking outside
            const closeMenu = (event: any) => {
              if (!contextMenu.contains(event.target)) {
                contextMenu.remove()
                document.removeEventListener('click', closeMenu)
              }
            }
            
            setTimeout(() => {
              document.addEventListener('click', closeMenu)
            }, 100)
          }, true)
          
          // Also try to find WebDataRocks internal elements and disable double click
          const gridElements = container.querySelectorAll('[class*="wdr"]')
          gridElements.forEach(element => {
            element.addEventListener('dblclick', (e) => {
              e.preventDefault()
              e.stopPropagation()
              return false
            }, true)
          })
        }
      }, 1000)

      // Helper function to convert pivot data to CSV
      const convertPivotToCSV = (report: any) => {
        try {
          // Get the current pivot data
          const data = report.dataSource.data
          if (!data || data.length === 0) return ''
          
          // Get headers
          const headers = Object.keys(data[0])
          const csvHeaders = headers.join(',')
          
          // Get rows
          const csvRows = data.map((row: any) => {
            return headers.map(header => {
              const value = row[header]
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value || ''
            }).join(',')
          })
          
          return [csvHeaders, ...csvRows].join('\n')
        } catch (error) {
          console.error('CSV conversion error:', error)
          return 'Hata: Veri dönüştürülemedi'
        }
      }

      // Helper function to download CSV
      const downloadCSV = (csvContent: any, filename: any) => {
        try {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          
          if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        } catch (error) {
          console.error('CSV download error:', error)
          alert('Dosya indirme hatası')
        }
      }
      
      console.log('✅ WebDataRocks instance created:', !!pivot)

      // Force show toolbar and add Fields button
      setTimeout(() => {
        // Try to find WebDataRocks toolbar first
        const container = pivotRef.current
        if (container) {
          let toolbar = container.querySelector('.wdr-toolbar')
          
          if (!toolbar) {
            // Create custom toolbar
            toolbar = document.createElement('div')
            if (toolbar && typeof toolbar.setAttribute === 'function') {
              toolbar.setAttribute('class', 'wdr-toolbar custom-toolbar')
              toolbar.style.cssText = `
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 10px;
              background: #f5f5f5;
              border-bottom: 1px solid #ddd;
              margin-bottom: 10px;
            `
            
              // Insert toolbar at the top
              container.insertBefore(toolbar, container.firstChild)
            }
          }
          
          // Add Fields button only if toolbar exists
          if (toolbar && typeof toolbar.appendChild === 'function') {
            const fieldsBtn = document.createElement('button')
            fieldsBtn.textContent = 'Fields'
            fieldsBtn.style.cssText = `
              padding: 8px 16px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            `
            fieldsBtn.onclick = () => {
              try {
                console.log('🔧 Fields button clicked, attempting to show Fields panel...')
                if (pivot) {
                  // Try different methods to show fields panel
                  if (typeof pivot.showFields === 'function') {
                    pivot.showFields()
                    console.log('✅ Fields panel opened via button')
                  } else if (typeof pivot.showToolbar === 'function') {
                    pivot.showToolbar()
                    console.log('✅ Toolbar shown as alternative')
                  } else if (typeof pivot.openFieldsPanel === 'function') {
                    pivot.openFieldsPanel()
                    console.log('✅ Fields panel opened via openFieldsPanel')
                  } else {
                    console.log('❌ No fields panel method available')
                    console.log('Available methods:', Object.getOwnPropertyNames(pivot))
                    alert('Fields panel açılamadı. WebDataRocks tam yüklenmemiş olabilir.')
                  }
                }
              } catch (e) {
                console.log('❌ Fields panel error:', e)
                alert('Fields panel açılamadı: ' + (e instanceof Error ? e.message : String(e)))
              }
            }
            
            toolbar.appendChild(fieldsBtn)
            
            // Add Save button
            const saveBtn = document.createElement('button')
            saveBtn.textContent = 'SQL Kaydet'
            saveBtn.style.cssText = `
              padding: 8px 16px;
              background: #28a745;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            `
            saveBtn.onclick = saveSettings
            toolbar.appendChild(saveBtn)
          }
        }
      }, 1500)

      // Show fields panel by default after WebDataRocks is fully ready
      setTimeout(() => {
        try {
          console.log('🔧 Attempting to show Fields panel...')
          if (pivot) {
            // Try different methods to show fields panel
            if (typeof pivot.showFields === 'function') {
              pivot.showFields()
              console.log('✅ Fields panel opened successfully')
            } else if (typeof pivot.showToolbar === 'function') {
              pivot.showToolbar()
              console.log('✅ Toolbar shown as alternative')
            } else if (typeof pivot.openFieldsPanel === 'function') {
              pivot.openFieldsPanel()
              console.log('✅ Fields panel opened via openFieldsPanel')
            } else {
              console.log('❌ No fields panel method available')
              console.log('Available methods:', Object.getOwnPropertyNames(pivot))
            }
          }
        } catch (e) {
          console.log('❌ Fields panel auto-show failed:', e)
        }
      }, 3000)

      // Save settings function
      const saveSettings = async () => {
        try {
          if (!user?.id) return alert('Giriş gerekli')
          
          const report = pivot.getReport()
          const payload = {
            userId: user.id,
            gridType: gridKey,
            columnSettings: [],
            filterSettings: {},
            sortSettings: [],
            sidebarSettings: null,
            viewPreferences: { report },
            companyId: user.companyId || null
          }
          
          const res = await fetch('/api/user-grid-settings', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
          })
          
          if (!res.ok) return alert('❌ Pivot ayarları kaydedilemedi')
          alert('✅ Pivot ayarları kaydedildi!')
        } catch (e) {
          alert('❌ Pivot ayarları kaydedilirken hata')
        }
      }

      // Load settings function
      const loadSettings = async () => {
        try {
          if (!user?.id) return
          
          const qs = new URLSearchParams({ userId: user.id, gridType: gridKey })
          const res = await fetch(`/api/user-grid-settings?${qs.toString()}`)
          if (!res.ok) return
          
          const json = await res.json()
          let vp = json?.settings?.viewPreferences
          if (typeof vp === 'string') { 
            try { vp = JSON.parse(vp) } catch {} 
          }
          
          if (vp?.report) {
            pivot.setReport(vp.report)
          }
        } catch {}
      }

      loadSettings()


    } catch (error) {
      console.error('Error initializing WebDataRocks:', error)
    }
  }, [isLoaded, data, user?.id, gridKey])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Pivot tablosu yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Get available fields from data
  const availableFields = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div className="w-full bg-white">
      {/* WebDataRocks Pivot Table */}
      <div ref={pivotRef} className="w-full" style={{ minHeight: 'calc(200vh - 100px)', height: 'calc(200vh - 100px)' }} />
    </div>
  )
}
