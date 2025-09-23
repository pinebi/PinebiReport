'use client'

import { AgGridReact } from 'ag-grid-react'
import { 
  ColDef, 
  GridReadyEvent, 
  GridApi, 
  ColumnApi,
  SideBarDef,
  GetRowIdParams,
  RowGroupingDisplayType
} from 'ag-grid-community'
// import { LicenseManager } from 'ag-grid-enterprise'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid, PieChart, Download, Upload, Filter } from 'lucide-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

interface DataGridProps {
  data: any[]
  columnDefs: ColDef[]
  title: string
  onAdd?: () => void
  onEdit?: (data: any) => void
  onDelete?: (data: any) => void
  loading?: boolean
}

export function DataGrid({ 
  data, 
  columnDefs, 
  title, 
  onAdd, 
  onEdit, 
  onDelete,
  loading = false 
}: DataGridProps) {
  
  // Use EnhancedDataGrid as fallback, but keep existing functionality for backward compatibility
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'pivot'>('grid')
  const [quickFilterText, setQuickFilterText] = useState('')

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
    setColumnApi(params.columnApi)
  }, [])

  const getRowId = useCallback((params: GetRowIdParams) => {
    return params.data.id
  }, [])

  const exportToCsv = useCallback(() => {
    if (gridApi && !gridApi.isDestroyed?.()) {
      try {
        gridApi.exportDataAsCsv({
          fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.csv`
        })
      } catch (error) {
        console.warn('⚠️ CSV export error:', error)
        alert('❌ CSV dışarı aktarma sırasında hata oluştu!')
      }
    }
  }, [gridApi, title])

  const exportToExcel = useCallback(() => {
    if (gridApi && !gridApi.isDestroyed?.()) {
      try {
        if (gridApi.exportDataAsExcel) {
          gridApi.exportDataAsExcel({
            fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`
          })
        } else {
          // Fallback to CSV if Excel export is not available
          console.log('⚠️ Excel export mevcut değil, CSV\'ye dönülüyor')
          exportToCsv()
        }
      } catch (error) {
        console.warn('⚠️ Excel export error:', error)
        alert('❌ Excel dışarı aktarma sırasında hata oluştu!')
      }
    }
  }, [gridApi, title, exportToCsv])

  const actionColumnDef: ColDef = useMemo(() => ({
    headerName: 'İşlemler',
    field: 'actions',
    cellRenderer: (params: any) => (
      <div className="flex gap-2">
        {onEdit && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit(params.data)}
          >
            Düzenle
          </Button>
        )}
        {onDelete && (
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDelete(params.data)}
          >
            Sil
          </Button>
        )}
      </div>
    ),
    width: 150,
    pinned: 'right',
    sortable: false,
    filter: false
  }), [onEdit, onDelete])

  const allColumnDefs = useMemo(() => {
    const cols = [...columnDefs]
    if (onEdit || onDelete) {
      cols.push(actionColumnDef)
    }
    return cols
  }, [columnDefs, actionColumnDef, onEdit, onDelete])

  const pivotColumnDefs = useMemo(() => {
    return columnDefs.map(col => ({
      ...col,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
      menuTabs: ['generalMenuTab', 'filterMenuTab', 'columnsMenuTab'],
      floatingFilter: true
    }))
  }, [columnDefs])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
    menuTabs: ['generalMenuTab', 'filterMenuTab', 'columnsMenuTab'],
    floatingFilter: viewMode === 'grid'
  }), [viewMode])

  const sideBar = useMemo((): SideBarDef => ({
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Sütunlar',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: false,
          suppressValues: false,
          suppressPivots: false,
          suppressPivotMode: false,
          suppressColumnFilter: false,
          suppressColumnSelectAll: false,
          suppressColumnExpandAll: false
        }
      },
      {
        id: 'filters',
        labelDefault: 'Filtreler',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel'
      },
      {
        id: 'stats',
        labelDefault: 'İstatistikler',
        labelKey: 'stats',
        iconKey: 'stats',
        toolPanel: 'agStatusBarToolPanel'
      }
    ],
    defaultToolPanel: viewMode === 'pivot' ? 'columns' : ''
  }), [viewMode])

  const statusBar = useMemo(() => ({
    statusPanels: [
      { statusPanel: 'agTotalRowCountComponent', align: 'left' },
      { statusPanel: 'agFilteredRowCountComponent', align: 'left' },
      { statusPanel: 'agSelectedRowCountComponent', align: 'left' },
      { statusPanel: 'agAggregationComponent', align: 'right' }
    ]
  }), [])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'pivot' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('pivot')}
            >
              <PieChart className="w-4 h-4 mr-1" />
              Pivot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
            >
              <Download className="w-4 h-4 mr-1" />
              Excel
            </Button>
            {onAdd && (
              <Button onClick={onAdd}>
                Yeni Ekle
              </Button>
            )}
          </div>
        </div>
        {viewMode === 'grid' && (
          <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4" />
            <input
              type="text"
              placeholder="Hızlı arama..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine w-full h-[700px]">
          <AgGridReact
            rowData={data}
            columnDefs={viewMode === 'grid' ? allColumnDefs : pivotColumnDefs}
            defaultColDef={defaultColDef}
            getRowId={getRowId}
            onGridReady={onGridReady}
            animateRows={true}
            rowSelection="multiple"
            rowMultiSelectWithClick={true}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[20, 50, 100, 200]}
            // enableRangeSelection={true}
            enableFillHandle={true}
            enableCellTextSelection={true}
            suppressMenuHide={false}
            suppressRowClickSelection={false}
            pivotMode={viewMode === 'pivot'}
            rowGroupPanelShow={viewMode === 'pivot' ? 'always' : 'never'}
            groupDisplayType={'multipleColumns' as RowGroupingDisplayType}
            suppressAggFuncInHeader={false}
            groupDefaultExpanded={1}
            autoGroupColumnDef={{
              headerName: 'Grup',
              minWidth: 200,
              cellRendererParams: {
                suppressCount: false,
                checkbox: true
              }
            }}
            // sideBar={sideBar}
            // statusBar={statusBar}
            quickFilterText={quickFilterText}
            // enableCharts={true}
            enableRangeHandle={true}
            loading={loading}
            loadingOverlayComponent={'agLoadingOverlay'}
            noRowsOverlayComponent={'agNoRowsOverlay'}
            overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Yükleniyor...</span>'}
            overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">Gösterilecek veri yok</span>'}
          />
        </div>
      </CardContent>
    </Card>
  )
}
