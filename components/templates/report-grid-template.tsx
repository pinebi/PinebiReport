'use client'

import { ColDef } from 'ag-grid-community'
import { useMemo } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'

/**
 * Yeni rapor gridleri için şablon component
 * Bu template'i kullanarak yeni rapor gridleri oluşturabilirsiniz
 * 
 * Kullanım:
 * 1. Bu dosyayı kopyalayın
 * 2. Interface'i rapor verilerinize göre güncelleyin
 * 3. columnDefs'i sütunlarınıza göre ayarlayın
 * 4. Formatter fonksiyonlarını ihtiyacınıza göre düzenleyin
 */

interface ReportData {
  // Rapor verilerinizin tiplerini buraya ekleyin
  // Örnek:
  // id: string
  // name: string
  // amount: number
  // date: string
  [key: string]: any
}

interface ReportGridTemplateProps {
  data: ReportData[]
  title?: string
  onAdd?: () => void
  onEdit?: (data: any) => void
  onDelete?: (data: any) => void
  loading?: boolean
}

export function ReportGridTemplate({ 
  data, 
  title = "Rapor", 
  onAdd, 
  onEdit, 
  onDelete,
  loading = false 
}: ReportGridTemplateProps) {
  
  // Para birimi formatter
  const currencyFormatter = (params: any) => {
    if (params.value == null) return ''
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(params.value)
  }

  // Tarih formatter
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

  // Sayı formatter
  const numberFormatter = (params: any) => {
    if (params.value == null) return ''
    return new Intl.NumberFormat('tr-TR').format(params.value)
  }

  // Sütun tanımları - İhtiyacınıza göre güncelleyin
  const columnDefs: any[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'name',
      headerName: 'İsim',
      width: 200,
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'date',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: dateFormatter,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'amount',
      headerName: 'Tutar',
      width: 130,
      type: 'numericColumn',
      valueFormatter: currencyFormatter,
      cellStyle: { fontWeight: 'bold', color: '#059669' }
    },
    {
      field: 'count',
      headerName: 'Adet',
      width: 100,
      type: 'numericColumn',
      valueFormatter: numberFormatter,
      cellStyle: { textAlign: 'center' }
    }
    // Daha fazla sütun ekleyebilirsiniz...
  ], [])

  return (
    <EnhancedDataGrid
      data={data}
      columnDefs={columnDefs}
      title={title}
      gridType="custom-report" // Bu template kullanılırken değiştirilebilir
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
    />
  )
}

/**
 * KULLANIM ÖRNEĞİ:
 * 
 * import { ReportGridTemplate } from '@/components/templates/report-grid-template'
 * 
 * export default function MyReportPage() {
 *   const [data, setData] = useState([])
 *   
 *   return (
 *     <ReportGridTemplate
 *       data={data}
 *       title="Benim Raporum"
 *       loading={loading}
 *     />
 *   )
 * }
 */
