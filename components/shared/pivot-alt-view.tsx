'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface PivotAltViewProps {
  data: any[]
  title?: string
  gridKey: string
}

export default function PivotAltView({ data, title = 'Pivot 2', gridKey }: PivotAltViewProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const configRef = useRef<any>(null)

  // load PivotTable.js via CDN (jQuery + jQuery-UI + pivottable)
  useEffect(() => {
    const load = async () => {
      const doc = document
      const w: any = window as any
      // jQuery
      if (!w.jQuery) {
        await new Promise<void>(resolve => {
          const s = doc.createElement('script')
          s.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
      // jQuery UI
      if (!doc.querySelector('link[data-jqui="1"]')) {
        const l = doc.createElement('link')
        l.rel = 'stylesheet'
        l.href = 'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css'
        l.setAttribute('data-jqui', '1')
        doc.head.appendChild(l)
      }
      if (!(w as any).jQuery?.ui) {
        await new Promise<void>(resolve => {
          const s = doc.createElement('script')
          s.src = 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
      // PivotTable CSS
      if (!doc.querySelector('link[data-pvt="1"]')) {
        const l = doc.createElement('link')
        l.rel = 'stylesheet'
        l.href = 'https://cdn.jsdelivr.net/npm/pivottable@2.23.0/dist/pivot.css'
        l.setAttribute('data-pvt', '1')
        doc.head.appendChild(l)
      }
      // PivotTable JS
      if (!(w as any).jQuery?.fn?.pivotUI) {
        await new Promise<void>(resolve => {
          const s = doc.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/pivottable@2.23.0/dist/pivot.min.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
      setReady(true)
    }
    load()
  }, [])

  const renderPivot = useCallback(() => {
    try {
      if (!ready || !containerRef.current) return
      const $: any = (window as any).jQuery
      if (!$.fn || !$.fn.pivotUI) return
      // destroy previous
      containerRef.current.innerHTML = ''
      const safeData = Array.isArray(data) ? data : []
      // Infer sensible defaults if none
      let inferred = configRef.current || config
      if (!inferred || (!inferred.rows?.length && !inferred.vals?.length)) {
        const first = safeData[0] || {}
        const keys = Object.keys(first)
        const sample = safeData.slice(0, 50)
        const numeric: string[] = []
        const nonNumeric: string[] = []
        keys.forEach(k => {
          const vals = sample.map(r => r?.[k]).filter(v => v !== null && v !== undefined && v !== '')
          const nums = vals.filter((v: any) => !isNaN(Number(v)))
          if (vals.length > 0 && nums.length >= Math.max(1, Math.floor(vals.length * 0.6))) numeric.push(k)
          else nonNumeric.push(k)
        })
        inferred = {
          rows: nonNumeric.slice(0, 1),
          cols: nonNumeric.slice(1, 2),
          aggregatorName: 'Sum',
          vals: numeric.slice(0, 1),
          rendererName: 'Table'
        }
        setConfig(inferred)
        configRef.current = inferred
      }
      const opts: any = {
        rows: inferred?.rows || [],
        cols: inferred?.cols || [],
        aggregatorName: inferred?.aggregatorName || 'Sum',
        vals: inferred?.vals || [],
        rendererName: inferred?.rendererName || 'Table',
        onRefresh: (cfg: any) => {
          const copy = { ...cfg }
          // remove functions/refs
          delete copy.rendererOptions
          delete copy.renderers
          delete copy.derivedAttributes
          delete copy.sorters
          const nextCfg = {
            rows: copy.rows,
            cols: copy.cols,
            aggregatorName: copy.aggregatorName,
            vals: copy.vals,
            rendererName: copy.rendererName
          }
          configRef.current = nextCfg
          // update state without retriggering pivot rebuild loop
          setConfig((prev: any) => {
            const same = JSON.stringify(prev) === JSON.stringify(nextCfg)
            return same ? prev : nextCfg
          })
        }
      }
      $(containerRef.current).pivotUI(safeData, opts, true)
    } catch {}
  }, [ready, data])

  useEffect(() => { renderPivot() }, [renderPivot])

  const saveSQL = useCallback(async () => {
    try {
      if (!user?.id) return alert('Giriş gerekli')
      const payload = {
        userId: user.id,
        gridType: gridKey,
        columnSettings: [],
        filterSettings: {},
        sortSettings: [],
        sidebarSettings: null,
        viewPreferences: { pivotConfig: config },
        companyId: user.companyId || null
      }
      const res = await fetch('/api/user-grid-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) return alert('❌ Pivot ayarları kaydedilemedi')
      alert('✅ Pivot ayarları kaydedildi!')
    } catch {
      alert('❌ Pivot ayarları kaydedilirken hata')
    }
  }, [user?.id, user?.companyId, gridKey, config])

  const loadSQL = useCallback(async () => {
    try {
      if (!user?.id) return
      const qs = new URLSearchParams({ userId: user.id, gridType: gridKey })
      const res = await fetch(`/api/user-grid-settings?${qs.toString()}`)
      if (!res.ok) return
      const json = await res.json()
      let vp = json?.settings?.viewPreferences
      if (typeof vp === 'string') { try { vp = JSON.parse(vp) } catch {} }
      if (vp?.pivotConfig) setConfig(vp.pivotConfig)
    } catch {}
  }, [user?.id, gridKey])

  useEffect(() => { loadSQL() }, [loadSQL])

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
        <div ref={containerRef} className="w-full overflow-auto" style={{ minHeight: 400 }} />
      </CardContent>
    </Card>
  )
}


