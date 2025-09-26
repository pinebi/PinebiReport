'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface PerspectivePivotViewProps {
  data: any[]
  title?: string
  gridKey: string
}

// Perspective (FINOS) pivot table / grid
export default function PerspectivePivotView({ data, title = 'Pivot', gridKey }: PerspectivePivotViewProps) {
  const { user } = useAuth()
  const viewerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [config, setConfig] = useState<any>(null)

  // Load web components from CDN to avoid bundling issues
  useEffect(() => {
    const load = async () => {
      const doc = document
      // CSS
      if (!doc.querySelector('link[data-persp]')) {
        const l = doc.createElement('link')
        l.rel = 'stylesheet'
        l.href = 'https://cdn.jsdelivr.net/npm/@finos/perspective-viewer@2.11.1/dist/css/themes.css'
        l.setAttribute('data-persp', '1')
        doc.head.appendChild(l)
      }
      // JS web components
      if (!(window as any).PerspectiveViewerElement) {
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/@finos/perspective-viewer@2.11.1/dist/umd/perspective-viewer.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/@finos/perspective-viewer-datagrid@2.11.1/dist/umd/perspective-viewer-datagrid.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/@finos/perspective-viewer-d3fc@2.11.1/dist/umd/perspective-viewer-d3fc.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
      setReady(true)
    }
    load()
  }, [])

  const render = useCallback(async () => {
    try {
      if (!ready || !viewerRef.current) return
      const viewer = viewerRef.current as any
      const worker = await (await import('https://cdn.jsdelivr.net/npm/@finos/perspective@2.11.1/dist/esm/perspective.js' as any)).default()
      // Create table and load data
      const table = await worker.table(Array.isArray(data) ? data : [])
      await (viewer as any).load(table)
      // Apply saved config
      if (config) {
        await (viewer as any).restore(config)
      } else {
        // infer a sensible default: first text as row pivot, first number as column or aggregate
        const first = (Array.isArray(data) && data.length > 0) ? data[0] : {}
        const keys = Object.keys(first)
        const sample = (Array.isArray(data) ? data : []).slice(0, 50)
        const numeric: string[] = []
        const nonNumeric: string[] = []
        keys.forEach(k => {
          const vals = sample.map(r => r?.[k]).filter(v => v !== null && v !== undefined && v !== '')
          const nums = vals.filter((v: any) => !isNaN(Number(v)))
          if (vals.length > 0 && nums.length >= Math.max(1, Math.floor(vals.length * 0.6))) numeric.push(k)
          else nonNumeric.push(k)
        })
        await (viewer as any).restore({
          group_by: nonNumeric.slice(0, 1),
          split_by: nonNumeric.slice(1, 2),
          columns: numeric.slice(0, 1),
          aggregates: Object.fromEntries(numeric.map(n => [n, 'sum']))
        })
      }
      // Listen config changes to save
      viewer.addEventListener('perspective-config-update', async () => {
        const cfg = await (viewer as any).save()
        setConfig(cfg)
      })
    } catch {}
  }, [ready, data, config])

  useEffect(() => { render() }, [render])

  const { user: _u } = { user }
  const saveSQL = useCallback(async () => {
    try {
      if (!user?.id) return alert('Giriş gerekli')
      const viewer = viewerRef.current as any
      const cfg = await (viewer as any).save()
      const payload = {
        userId: user.id,
        gridType: gridKey,
        columnSettings: [],
        filterSettings: {},
        sortSettings: [],
        sidebarSettings: null,
        viewPreferences: { perspectiveConfig: cfg },
        companyId: user.companyId || null
      }
      const res = await fetch('/api/user-grid-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) return alert('❌ Pivot ayarları kaydedilemedi')
      alert('✅ Pivot ayarları kaydedildi!')
    } catch {
      alert('❌ Pivot ayarları kaydedilirken hata')
    }
  }, [user?.id, user?.companyId, gridKey])

  // Load saved config
  useEffect(() => {
    const loadSQL = async () => {
      try {
        if (!user?.id) return
        const qs = new URLSearchParams({ userId: user.id, gridType: gridKey })
        const res = await fetch(`/api/user-grid-settings?${qs.toString()}`)
        if (!res.ok) return
        const json = await res.json()
        let vp = json?.settings?.viewPreferences
        if (typeof vp === 'string') { try { vp = JSON.parse(vp) } catch {} }
        if (vp?.perspectiveConfig) setConfig(vp.perspectiveConfig)
      } catch {}
    }
    loadSQL()
  }, [user?.id, gridKey])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveSQL} className="bg-amber-50 border-amber-200 hover:bg-amber-100">SQL Kaydet</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* perspective-viewer web component */}
        <div ref={viewerRef} style={{ height: 600, width: '100%' }} data-theme="Vaporwave"></div>
      </CardContent>
    </Card>
  )
}





