'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

type AggFunc = 'sum' | 'count' | 'avg' | 'min' | 'max'

interface PivotViewProps {
  data: any[]
  title?: string
  gridKey: string // unique key: e.g. pivot-<reportId>-company-<companyId>
}

export default function PivotView({ data, title = 'Pivot', gridKey }: PivotViewProps) {
  const { user } = useAuth()

  const [rowField, setRowField] = useState<string>('')
  const [colField, setColField] = useState<string>('')
  const [valueField, setValueField] = useState<string>('')
  const [aggFunc, setAggFunc] = useState<AggFunc>('sum')
  const tableRef = useRef<HTMLTableElement | null>(null)
  const dtInstanceRef = useRef<any>(null)
  const [colOrder, setColOrder] = useState<string[]>([])
  const dragIndexRef = useRef<number | null>(null)

  const fields = useMemo(() => {
    if (!data || data.length === 0) return [] as string[]
    return Object.keys(data[0])
  }, [data])

  // infer defaults once with specific preferences for the report
  useEffect(() => {
    if (!data || data.length === 0) return
    if (!rowField || !colField || !valueField) {
      const keys = Object.keys(data[0] || {})
      const sample = data.slice(0, 50)
      const numeric: string[] = []
      const nonNumeric: string[] = []
      keys.forEach(k => {
        const vals = sample.map(r => r?.[k]).filter(v => v !== null && v !== undefined && v !== '')
        const nums = vals.filter(v => !isNaN(Number(v)))
        if (vals.length > 0 && nums.length >= Math.max(1, Math.floor(vals.length * 0.6))) numeric.push(k)
        else nonNumeric.push(k)
      })
      
      // Specific defaults for the report
      const hasAy = keys.includes('Ay') || keys.includes('AyAdi')
      const hasTarihGun = keys.includes('TarihGun') || keys.includes('Tarih') || keys.includes('Gun')
      const hasDesc = keys.includes('DESCRIPTION') || keys.includes('Desc') || keys.includes('Açıklama')
      const hasAdet = keys.includes('Adet')
      
      if (!rowField) {
        if (hasAy) setRowField(keys.includes('Ay') ? 'Ay' : 'AyAdi')
        else if (hasTarihGun) setRowField(keys.includes('TarihGun') ? 'TarihGun' : (keys.includes('Tarih') ? 'Tarih' : 'Gun'))
        else setRowField(nonNumeric[0] || keys[0] || '')
      }
      if (!colField) {
        if (hasDesc) setColField(keys.includes('DESCRIPTION') ? 'DESCRIPTION' : (keys.includes('Desc') ? 'Desc' : 'Açıklama'))
        else setColField(nonNumeric[1] || nonNumeric[0] || keys[1] || keys[0] || '')
      }
      if (!valueField) {
        if (hasAdet) setValueField('Adet')
        else setValueField(numeric[0] || keys.find(k => !isNaN(Number(sample[0]?.[k]))) || '')
      }
    }
  }, [data, rowField, colField, valueField])

  const pivotTable = useMemo(() => {
    if (!data || data.length === 0 || !rowField || !colField || !valueField) return { headers: [] as string[], rows: [] as any[] }
    
    // Create a more sophisticated pivot structure
    const colKeysSet = new Set<string>()
    const rowKeysSet = new Set<string>()
    const map = new Map<string, Map<string, number[]>>()
    
    // Process data
    for (const r of data) {
      const rKey = String(r?.[rowField] ?? '')
      const cKey = String(r?.[colField] ?? '')
      const v = Number(r?.[valueField] ?? 0)
      
      colKeysSet.add(cKey)
      rowKeysSet.add(rKey)
      
      if (!map.has(rKey)) map.set(rKey, new Map<string, number[]>())
      const inner = map.get(rKey)!
      if (!inner.has(cKey)) inner.set(cKey, [])
      inner.get(cKey)!.push(isNaN(v) ? 0 : v)
    }
    
    const colKeys = Array.from(colKeysSet).sort()
    const rowKeys = Array.from(rowKeysSet).sort()
    
    // Create headers with proper formatting
    const headers = ['#', ...colKeys, 'Toplam']
    
    const aggVal = (arr: number[]): number => {
      if (arr.length === 0) return 0
      switch (aggFunc) {
        case 'sum': return arr.reduce((a, b) => a + b, 0)
        case 'count': return arr.length
        case 'avg': return arr.reduce((a, b) => a + b, 0) / arr.length
        case 'min': return Math.min(...arr)
        case 'max': return Math.max(...arr)
        default: return arr.reduce((a, b) => a + b, 0)
      }
    }
    
    // Create rows with proper formatting
    const rows = rowKeys.map((rk) => {
      const row: any = { __key: rk }
      let total = 0
      
      colKeys.forEach(ck => {
        const values = map.get(rk)?.get(ck) || []
        const v = aggVal(values)
        row[ck] = v
        total += typeof v === 'number' && aggFunc !== 'avg' ? v : 0
      })
      
      row.__total = total
      return row
    })
    
    // Add grand total row
    const grandTotalRow: any = { __key: 'Toplam' }
    let grandTotal = 0
    
    colKeys.forEach(ck => {
      let colTotal = 0
      rowKeys.forEach(rk => {
        const values = map.get(rk)?.get(ck) || []
        const v = aggVal(values)
        colTotal += typeof v === 'number' && aggFunc !== 'avg' ? v : 0
      })
      grandTotalRow[ck] = colTotal
      grandTotal += colTotal
    })
    grandTotalRow.__total = grandTotal
    rows.push(grandTotalRow)
    
    return { headers, rows, colKeys }
  }, [data, rowField, colField, valueField, aggFunc])

  // Sync column order with detected colKeys
  useEffect(() => {
    const keys = (pivotTable as any).colKeys || []
    if (keys.length === 0) { setColOrder([]); return }
    // If no order yet, or keys changed (added/removed), rebuild keeping previous ordering where possible
    setColOrder(prev => {
      if (!prev || prev.length === 0) return [...keys]
      const set = new Set(keys)
      const kept = prev.filter(k => set.has(k))
      const added = keys.filter((k: any) => !kept.includes(k))
      return [...kept, ...added]
    })
  }, [pivotTable.headers])

  // Load DataTables (CDN) once and initialize for the pivot table
  useEffect(() => {
    // Temporarily disable DataTables to prevent flicker/vanish; render plain table reliably
    const enableDT = false
    if (!enableDT) {
      return
    }
    const ensureCdnLoaded = async () => {
      const doc = document
      const hasJq = (window as any).jQuery
      if (!hasJq) {
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
      const hasDtCss = doc.querySelector("link[data-dt='1']")
      if (!hasDtCss) {
        const l = doc.createElement('link')
        l.rel = 'stylesheet'
        l.href = 'https://cdn.datatables.net/2.1.5/css/dataTables.dataTables.min.css'
        l.setAttribute('data-dt', '1')
        doc.head.appendChild(l)
      }
      const hasDt = (window as any).DataTable || (window as any).jQuery?.fn?.DataTable
      if (!hasDt) {
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://cdn.datatables.net/2.1.5/js/dataTables.min.js'
          s.onload = () => resolve()
          doc.head.appendChild(s)
        })
      }
    }

    ensureCdnLoaded()
      .then(() => {
        // Defer until table is rendered
        setTimeout(() => {
          try {
            if (!tableRef.current) return
            const $: any = (window as any).jQuery
            if (!$.fn || !$.fn.DataTable) return
            // Destroy previous
            if (dtInstanceRef.current) {
              dtInstanceRef.current.destroy(true)
              dtInstanceRef.current = null
            }

            // Add a second header row for column filters (selects)
            const thead = tableRef.current.querySelector('thead')
            if (thead) {
              const existing = thead.querySelector('tr[data-filter-row="1"]')
              if (existing) existing.remove()
              const filterRow = document.createElement('tr')
              filterRow.setAttribute('data-filter-row', '1')
              const headers = tableRef.current.querySelectorAll('thead tr:first-child th')
              headers.forEach((_th, idx) => {
                const th = document.createElement('th')
                if (idx === 0) {
                  th.innerHTML = '<input type="text" placeholder="#" style="width:100%;box-sizing:border-box;" />'
                } else if (idx === headers.length - 1) {
                  th.innerHTML = '<span style="opacity:.6">Toplam</span>'
                } else {
                  th.innerHTML = '<select multiple style="width:100%"></select>'
                }
                filterRow.appendChild(th)
              })
              thead.appendChild(filterRow)
            }

            dtInstanceRef.current = $(tableRef.current).DataTable({
              pageLength: 25,
              lengthMenu: [25, 50, 100, 250],
              order: [],
              deferRender: true,
              autoWidth: false,
              dom: 'lrtip'
            })

            // Hook up selects for multi-select filtering
            const api = dtInstanceRef.current
            const headerCount = tableRef.current.querySelectorAll('thead tr:first-child th').length
            tableRef.current.querySelectorAll('thead tr[data-filter-row="1"] th').forEach((th, idx) => {
              const sel = th.querySelector('select') as HTMLSelectElement | null
              const inp = th.querySelector('input') as HTMLInputElement | null
              if (sel) {
                // collect unique values from this column
                const col = api.column(idx)
                const uniques: string[] = []
                col.data().unique().sort().each((d: any) => {
                  const v = String(d ?? '')
                  if (v && !uniques.includes(v)) uniques.push(v)
                })
                sel.innerHTML = uniques.map(v => `<option value="${v}">${v}</option>`).join('')
                // filter on change
                sel.addEventListener('change', () => {
                  const selected = Array.from(sel.selectedOptions).map(o => o.value)
                  if (selected.length === 0) {
                    col.search('').draw()
                  } else {
                    const regex = selected.map(v => `^${v.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`).join('|')
                    col.search(regex, true, false).draw()
                  }
                })
              }
              if (inp) {
                const col = api.column(idx)
                inp.addEventListener('keyup', () => {
                  col.search(inp.value).draw()
                })
              }
            })
          } catch {}
        }, 0)
      })

    return () => {
      try {
        if (dtInstanceRef.current) {
          dtInstanceRef.current.destroy(true)
          dtInstanceRef.current = null
        }
      } catch {}
    }
  }, [pivotTable.headers, pivotTable.rows, gridKey])

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
        viewPreferences: { rowField, colField, valueField, aggFunc, colOrder },
        companyId: user.companyId || null
      }
      const res = await fetch('/api/user-grid-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) return alert('❌ Pivot ayarları kaydedilemedi')
      alert('✅ Pivot ayarları kaydedildi!')
    } catch (e) {
      alert('❌ Pivot ayarları kaydedilirken hata')
    }
  }, [user?.id, user?.companyId, gridKey, rowField, colField, valueField, aggFunc])

  const loadSQL = useCallback(async () => {
    try {
      if (!user?.id) return
      const qs = new URLSearchParams({ userId: user.id, gridType: gridKey })
      const res = await fetch(`/api/user-grid-settings?${qs.toString()}`)
      if (!res.ok) return
      const json = await res.json()
      let vp = json?.settings?.viewPreferences
      if (typeof vp === 'string') { try { vp = JSON.parse(vp) } catch {} }
      if (vp) {
        if (vp.rowField) setRowField(vp.rowField)
        if (vp.colField) setColField(vp.colField)
        if (vp.valueField) setValueField(vp.valueField)
        if (vp.aggFunc) setAggFunc(vp.aggFunc)
        if (Array.isArray(vp.colOrder)) setColOrder(vp.colOrder)
      }
    } catch {}
  }, [user?.id, gridKey])

  useEffect(() => { loadSQL() }, [loadSQL])

  return (
    <div className="w-full h-full bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium">Grid Görünüm</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium">Pivot Görünüm</button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Görünümü Kaydet</button>
          <button className="px-3 py-1 bg-orange-500 text-white text-sm rounded">Sıfırla</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Connect</span>
            <span className="text-xs text-gray-600">Open</span>
            <span className="text-xs text-gray-600">Save</span>
            <span className="text-xs text-gray-600">Export</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Format</span>
            <span className="text-xs text-gray-600">Options</span>
            <span className="text-xs text-gray-600">Fields</span>
            <span className="text-xs text-gray-600">Fullscreen</span>
          </div>
        </div>
      </div>

      {/* Pivot Configuration */}
      <div className="flex items-center gap-2 p-3 bg-gray-100 border-b">
        <select value={rowField} onChange={(e) => setRowField(e.target.value)} className="text-xs border rounded px-2 py-1">
          <option value="">Satır Alanı</option>
          {fields.map(f => (<option key={f} value={f}>{f}</option>))}
        </select>
        <select value={colField} onChange={(e) => setColField(e.target.value)} className="text-xs border rounded px-2 py-1">
          <option value="">Sütun Alanı</option>
          {fields.map(f => (<option key={f} value={f}>{f}</option>))}
        </select>
        <select value={valueField} onChange={(e) => setValueField(e.target.value)} className="text-xs border rounded px-2 py-1">
          <option value="">Değer Alanı</option>
          {fields.map(f => (<option key={f} value={f}>{f}</option>))}
        </select>
        <select value={aggFunc} onChange={(e) => setAggFunc(e.target.value as AggFunc)} className="text-xs border rounded px-2 py-1">
          <option value="sum">Toplam</option>
          <option value="count">Adet</option>
          <option value="avg">Ortalama</option>
          <option value="min">Min</option>
          <option value="max">Max</option>
        </select>
        <button onClick={saveSQL} className="px-3 py-1 bg-amber-500 text-white text-xs rounded">SQL Kaydet</button>
      </div>

      {/* Pivot Table */}
      <div className="overflow-auto h-[600px]">
        <table ref={tableRef} className="w-full text-sm" id={`${gridKey}-table`}>
          <thead>
            <tr>
              <th className="px-3 py-2 border-b bg-gray-50 sticky top-0 text-left font-medium">{rowField || '#'}</th>
              {(colOrder.length > 0 ? colOrder : (pivotTable as any).colKeys || []).map((h: any, idx: any) => (
                <th
                  key={h}
                  className="px-3 py-2 border-b bg-gray-50 sticky top-0 text-center font-medium select-none"
                  draggable
                  onDragStart={() => { dragIndexRef.current = idx }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = dragIndexRef.current
                    const to = idx
                    if (from === null || to === null || from === to) return
                    setColOrder(prev => {
                      const arr = [...prev]
                      const [moved] = arr.splice(from, 1)
                      arr.splice(to, 0, moved)
                      return arr
                    })
                    dragIndexRef.current = null
                  }}
                  title="Sürükleyip bırakın"
                >
                  {h}
                </th>
              ))}
              <th className="px-3 py-2 border-b bg-gray-50 sticky top-0 text-center font-medium">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {pivotTable.rows.map((r: any, rowIdx) => (
              <tr key={r.__key} className={`hover:bg-gray-50 ${r.__key === 'Toplam' ? 'bg-blue-50 font-bold' : ''}`}>
                <td className="px-3 py-2 border-b font-medium whitespace-nowrap">{r.__key}</td>
                {(colOrder.length > 0 ? colOrder : (pivotTable as any).colKeys || []).map((ck: string) => (
                  <td key={ck} className="px-3 py-2 border-b text-center tabular-nums">
                    {typeof r[ck] === 'number' ? r[ck].toLocaleString('tr-TR') : (r[ck] ?? '')}
                  </td>
                ))}
                <td className="px-3 py-2 border-b text-center font-semibold">
                  {typeof r.__total === 'number' ? r.__total.toLocaleString('tr-TR') : r.__total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


