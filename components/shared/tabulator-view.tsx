'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface TabulatorViewProps {
  data: any[]
  title?: string
}

export default function TabulatorView({ data, title = 'Tablo' }: TabulatorViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tabulatorRef = useRef<any>(null)

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [] as any[]
    const first = data[0]
    return Object.keys(first).map((key) => {
      const sample = (data || []).slice(0, 30).map(r => r?.[key]).filter(v => v !== undefined && v !== null && v !== '')
      const numCount = sample.filter(v => !isNaN(Number(v))).length
      const isNumeric = numCount >= Math.max(1, Math.floor(sample.length * 0.6))
      if (isNumeric) {
        return {
          title: key,
          field: key,
          hozAlign: 'right',
          headerFilter: 'number'
        }
      }
      // Unique list for set-like filtering
      const values = Array.from(new Set(sample.map(v => String(v))))
      return {
        title: key,
        field: key,
        headerFilter: 'list',
        headerFilterParams: { values, clearable: true, multiselect: true }
      }
    })
  }, [data])

  useEffect(() => {
    const loadCdn = async () => {
      const doc = document
      if (!doc.querySelector("link[data-tabulator='1']")) {
        const l = doc.createElement('link')
        l.rel = 'stylesheet'
        l.href = 'https://unpkg.com/tabulator-tables@5.6.2/dist/css/tabulator.min.css'
        l.setAttribute('data-tabulator', '1')
        doc.head.appendChild(l)
      }
      if (!(window as any).Tabulator) {
        await new Promise<void>((resolve) => {
          const s = doc.createElement('script')
          s.src = 'https://unpkg.com/tabulator-tables@5.6.2/dist/js/tabulator.min.js'
          s.onload = () => resolve()
          doc.body.appendChild(s)
        })
      }
    }

    loadCdn().then(() => {
      setTimeout(() => {
        try {
          const Tabulator: any = (window as any).Tabulator
          if (!Tabulator || !containerRef.current) return
          // Destroy previous
          if (tabulatorRef.current) {
            tabulatorRef.current.destroy()
            tabulatorRef.current = null
          }
          tabulatorRef.current = new Tabulator(containerRef.current, {
            height: 700,
            dataTree: false,
            layout: 'fitDataStretch',
            movableColumns: true,
            selectable: true,
            reactiveData: true,
            columns,
            data,
          })
        } catch {}
      }, 0)
    })

    return () => {
      try {
        if (tabulatorRef.current) {
          tabulatorRef.current.destroy()
          tabulatorRef.current = null
        }
      } catch {}
    }
  }, [data, columns])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded">
          <div ref={containerRef} />
        </div>
      </CardContent>
    </Card>
  )
}





























