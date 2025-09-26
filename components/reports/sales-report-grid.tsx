'use client'

import { ColDef } from 'ag-grid-community'
import { useMemo } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'

interface SalesReportData {
  TarihGun: string
  Ay: number
  AyAdi: string
  DESCRIPTION: string
  Adet: number
  Tutar: number
}

interface SalesReportGridProps {
  data: SalesReportData[]
  title?: string
}

export function SalesReportGrid({ data, title = "Satış Raporu" }: SalesReportGridProps) {
  
  const currencyFormatter = (params: any) => {
    if (params.value == null) return ''
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(params.value)
  }

  const columnDefs: any[] = useMemo(() => [
    {
      field: 'TarihGun',
      headerName: 'Tarih',
      width: 150,
      cellStyle: { fontWeight: 'bold', textAlign: 'left' }
    },
    {
      field: 'AyAdi',
      headerName: 'Ay',
      width: 100,
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'DESCRIPTION',
      headerName: 'Açıklama',
      width: 200,
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'Adet',
      headerName: 'Adet',
      width: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'center', color: '#059669' }
    },
    {
      field: 'Tutar',
      headerName: 'Tutar',
      width: 120,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { fontWeight: 'bold', color: '#1f2937' }
    }
  ], [])

  return (
    <EnhancedDataGrid
      data={data}
      columnDefs={columnDefs}
      title={title}
      gridType="sales-report"
    />
  )
}
