'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Search,
  Download,
  RefreshCw,
  Settings,
  Save,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export interface FilterOption {
  id: string
  name: string
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'boolean'
  label: string
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: any
  required?: boolean
}

export interface FilterValue {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn'
  value: any
  value2?: any // For between operator
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  onFiltersChange: (filters: FilterValue[]) => void
  onExport?: () => void
  onReset?: () => void
  className?: string
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onReset,
  className 
}: AdvancedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })

  const handleFilterChange = (field: string, operator: string, value: any, value2?: any) => {
    const newFilter: FilterValue = { field, operator: operator as any, value, value2 }
    
    setActiveFilters(prev => {
      const existing = prev.find(f => f.field === field)
      if (existing) {
        return prev.map(f => f.field === field ? newFilter : f)
      } else {
        return [...prev, newFilter]
      }
    })
  }

  const removeFilter = (field: string) => {
    setActiveFilters(prev => prev.filter(f => f.field !== field))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setSelectedDate(undefined)
    setDateRange({ from: undefined, to: undefined })
    onReset?.()
  }

  const applyFilters = () => {
    onFiltersChange(activeFilters)
  }

  const saveFilterPreset = () => {
    const presetName = prompt('Filtre ön ayarı adı:')
    if (presetName) {
      const presets = JSON.parse(localStorage.getItem('filterPresets') || '{}')
      presets[presetName] = activeFilters
      localStorage.setItem('filterPresets', JSON.stringify(presets))
    }
  }

  const loadFilterPreset = (presetName: string) => {
    const presets = JSON.parse(localStorage.getItem('filterPresets') || '{}')
    const preset = presets[presetName]
    if (preset) {
      setActiveFilters(preset)
    }
  }

  const getOperatorOptions = (type: string) => {
    switch (type) {
      case 'text':
        return [
          { value: 'contains', label: 'İçerir' },
          { value: 'equals', label: 'Eşittir' },
          { value: 'startsWith', label: 'Başlar' },
          { value: 'endsWith', label: 'Biter' }
        ]
      case 'number':
        return [
          { value: 'equals', label: 'Eşittir' },
          { value: 'greaterThan', label: 'Büyüktür' },
          { value: 'lessThan', label: 'Küçüktür' },
          { value: 'between', label: 'Arasında' }
        ]
      case 'date':
      case 'daterange':
        return [
          { value: 'equals', label: 'Eşittir' },
          { value: 'greaterThan', label: 'Sonrası' },
          { value: 'lessThan', label: 'Öncesi' },
          { value: 'between', label: 'Arasında' }
        ]
      case 'select':
        return [
          { value: 'equals', label: 'Eşittir' },
          { value: 'in', label: 'İçinde' },
          { value: 'notIn', label: 'İçinde Değil' }
        ]
      default:
        return [{ value: 'equals', label: 'Eşittir' }]
    }
  }

  const renderFilterInput = (filter: FilterOption) => {
    const currentFilter = activeFilters.find(f => f.field === filter.id)
    const operator = currentFilter?.operator || 'equals'

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder}
            value={currentFilter?.value || ''}
            onChange={(e) => handleFilterChange(filter.id, operator, e.target.value)}
          />
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder={filter.placeholder}
              value={currentFilter?.value || ''}
              onChange={(e) => handleFilterChange(filter.id, operator, e.target.value)}
            />
            {operator === 'between' && (
              <Input
                type="number"
                placeholder="İkinci değer"
                value={currentFilter?.value2 || ''}
                onChange={(e) => handleFilterChange(filter.id, operator, currentFilter?.value, e.target.value)}
              />
            )}
          </div>
        )
      
      case 'select':
        return (
          <Select
            value={currentFilter?.value || ''}
            onValueChange={(value) => handleFilterChange(filter.id, operator, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: tr }) : "Tarih seç"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  handleFilterChange(filter.id, operator, date)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      
      case 'daterange':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "dd/MM", { locale: tr })} - ${format(dateRange.to, "dd/MM", { locale: tr })}`
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: tr })
                  )
                ) : (
                  "Tarih aralığı seç"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range || { from: undefined, to: undefined })
                  handleFilterChange(filter.id, operator, range?.from, range?.to)
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Gelişmiş Filtreler
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Daralt' : 'Genişlet'}
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-1" />
                Dışa Aktar
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activeFilters.map(filter => {
              const filterOption = filters.find(f => f.id === filter.field)
              return (
                <Badge key={filter.field} variant="secondary" className="flex items-center gap-1">
                  {filterOption?.label}: {filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(filter.field)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Temizle
            </Button>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">{filter.label}</Label>
                  {filter.required && <span className="text-red-500">*</span>}
                </div>
                
                <Select
                  value={activeFilters.find(f => f.field === filter.id)?.operator || 'equals'}
                  onValueChange={(operator) => {
                    const currentFilter = activeFilters.find(f => f.field === filter.id)
                    handleFilterChange(filter.id, operator, currentFilter?.value, currentFilter?.value2)
                  }}
                >
                  <SelectTrigger className="mb-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorOptions(filter.type).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button onClick={applyFilters} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Filtrele
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={saveFilterPreset}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Ön Ayarlar
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}




