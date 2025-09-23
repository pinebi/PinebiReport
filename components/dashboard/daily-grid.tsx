'use client'

import { ColDef } from 'ag-grid-community'
import { useMemo } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'

interface DailyGridData {
  Tarih: string
  Firma: string
  'Musteri Sayisi': number
  NAKIT: number
  KREDI_KARTI: number
  ACIK_HESAP: number
  'NAKIT+KREDI_KARTI': number
  GENEL_TOPLAM: number
}

interface DailyGridProps {
  data: DailyGridData[]
  title?: string
}

export function DailyGrid({ data, title = "Günlük Grid" }: DailyGridProps) {
  
  const currencyFormatter = (params: any) => {
    if (params.value == null) return ''
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(params.value)
  }

  const dateFormatter = (params: any) => {
    if (!params.value) return ''
    try {
      const date = new Date(params.value)
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    } catch {
      return params.value
    }
  }

  const columnDefs = useMemo(() => [
    {
      field: 'Tarih',
      headerName: 'Tarih',
      flex: 1,
      minWidth: 120,
      maxWidth: 150,
      valueFormatter: dateFormatter,
      cellStyle: { 
        fontWeight: 'bold',
        textAlign: 'center'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'Firma',
      headerName: 'Firma',
      flex: 2,
      minWidth: 180,
      maxWidth: 250,
      cellStyle: { 
        fontWeight: '500',
        textAlign: 'left',
        paddingLeft: '12px',
        color: '#374151'
      },
      headerClass: 'ag-header-left',
    },
    {
      field: 'Musteri Sayisi',
      headerName: 'Müşteri Sayısı',
      flex: 1,
      minWidth: 120,
      maxWidth: 150,
      type: 'numericColumn',
      cellStyle: { 
        textAlign: 'center'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'NAKIT',
      headerName: 'NAKİT',
      flex: 1,
      minWidth: 120,
      maxWidth: 160,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { 
        fontWeight: '500', 
        color: '#059669',
        textAlign: 'right',
        paddingRight: '12px'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'KREDI_KARTI',
      headerName: 'KREDİ KARTI',
      flex: 1,
      minWidth: 130,
      maxWidth: 170,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { 
        fontWeight: '500', 
        color: '#7c3aed',
        textAlign: 'right',
        paddingRight: '12px'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'ACIK_HESAP',
      headerName: 'AÇIK HESAP',
      flex: 1,
      minWidth: 120,
      maxWidth: 160,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { 
        fontWeight: '500', 
        color: '#dc2626',
        textAlign: 'right',
        paddingRight: '12px'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'NAKIT+KREDI_KARTI',
      headerName: 'NAKİT+KREDİ KARTI',
      flex: 1,
      minWidth: 150,
      maxWidth: 200,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { 
        fontWeight: 'bold', 
        color: '#1f2937',
        textAlign: 'right',
        paddingRight: '12px'
      },
      headerClass: 'ag-header-center'
    },
    {
      field: 'GENEL_TOPLAM',
      headerName: 'GENEL TOPLAM',
      flex: 1,
      minWidth: 140,
      maxWidth: 180,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { 
        fontWeight: 'bold', 
        color: '#1f2937', 
        backgroundColor: '#f3f4f6',
        textAlign: 'right',
        paddingRight: '12px'
      },
      headerClass: 'ag-header-center'
    }
  ] as ColDef[], [])

  return (
    <EnhancedDataGrid
      data={data}
      columnDefs={columnDefs}
      title={title}
      gridType="dashboard-daily-grid"
    />
  )
}