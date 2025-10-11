'use client'

import React, { useState, useCallback } from 'react'
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
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings,
  Save,
  Eye,
  Copy,
  Move,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Square,
  Circle,
  List,
  Image,
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormField {
  id: string
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'toggle' | 'rating' | 'color'
  label: string
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  defaultValue?: any
  helpText?: string
  width?: 'full' | 'half' | 'third' | 'quarter'
  order: number
}

export interface FormBuilderProps {
  initialFields?: FormField[]
  onSave?: (fields: FormField[], formName: string) => void
  onPreview?: (fields: FormField[]) => void
  className?: string
}

const fieldTypes = [
  { type: 'text', label: 'Metin', icon: Type, description: 'Tek satır metin girişi' },
  { type: 'textarea', label: 'Çoklu Metin', icon: FileText, description: 'Çoklu satır metin girişi' },
  { type: 'number', label: 'Sayı', icon: Hash, description: 'Sayısal değer girişi' },
  { type: 'email', label: 'E-posta', icon: Type, description: 'E-posta adresi girişi' },
  { type: 'password', label: 'Şifre', icon: Type, description: 'Şifre girişi' },
  { type: 'select', label: 'Seçim Listesi', icon: List, description: 'Açılır liste seçimi' },
  { type: 'checkbox', label: 'Onay Kutusu', icon: CheckSquare, description: 'Çoklu seçim' },
  { type: 'radio', label: 'Radyo Buton', icon: Circle, description: 'Tek seçim' },
  { type: 'date', label: 'Tarih', icon: Calendar, description: 'Tarih seçimi' },
  { type: 'file', label: 'Dosya', icon: Image, description: 'Dosya yükleme' },
  { type: 'toggle', label: 'Açma/Kapama', icon: ToggleRight, description: 'Açık/Kapalı durumu' },
  { type: 'color', label: 'Renk', icon: Circle, description: 'Renk seçimi' }
]

export function FormBuilder({ 
  initialFields = [], 
  onSave, 
  onPreview,
  className 
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [formName, setFormName] = useState('Yeni Form')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const generateId = () => `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Alanı`,
      placeholder: '',
      required: false,
      width: 'full',
      order: fields.length
    }

    if (type === 'select' || type === 'radio') {
      newField.options = [
        { label: 'Seçenek 1', value: 'option1' },
        { label: 'Seçenek 2', value: 'option2' }
      ]
    }

    setFields(prev => [...prev, newField])
    setSelectedField(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    )
    
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
    }
  }

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: generateId(),
      label: `${field.label} (Kopya)`,
      order: fields.length
    }
    setFields(prev => [...prev, newField])
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newFields = Array.from(fields)
    const [reorderedField] = newFields.splice(result.source.index, 1)
    newFields.splice(result.destination.index, 0, reorderedField)

    // Update order
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index
    }))

    setFields(updatedFields)
  }

  const getFieldIcon = (type: FormField['type']) => {
    const fieldType = fieldTypes.find(ft => ft.type === type)
    return fieldType ? fieldType.icon : Type
  }

  const renderFieldPreview = (field: FormField) => {
    const Icon = getFieldIcon(field.type)
    
    return (
      <div className={cn(
        "p-3 border rounded-lg bg-white",
        selectedField?.id === field.id && "ring-2 ring-blue-500"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
          <Badge variant="secondary" className="text-xs">
            {field.width}
          </Badge>
        </div>

        <div className="space-y-2">
          {renderFieldInput(field, true)}
          {field.helpText && (
            <p className="text-xs text-gray-500">{field.helpText}</p>
          )}
        </div>
      </div>
    )
  }

  const renderFieldInput = (field: FormField, isPreview: boolean = false) => {
    const commonProps = {
      placeholder: field.placeholder,
      disabled: isPreview
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return <Input type={field.type} {...commonProps} />
      
      case 'number':
        return <Input type="number" {...commonProps} />
      
      case 'textarea':
        return (
          <textarea
            className="w-full p-2 border rounded-md resize-none"
            rows={3}
            {...commonProps}
          />
        )
      
      case 'select':
        return (
          <Select disabled={isPreview}>
            <SelectTrigger>
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" disabled={isPreview} />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="radio" name={field.id} disabled={isPreview} />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'date':
        return <Input type="date" {...commonProps} />
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Dosya seçin veya sürükleyin</p>
          </div>
        )
      
      case 'toggle':
        return (
          <label className="flex items-center gap-2">
            <input type="checkbox" className="sr-only" disabled={isPreview} />
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
            </div>
            <span className="text-sm">Açık</span>
          </label>
        )
      
      case 'color':
        return <Input type="color" {...commonProps} />
      
      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Field Palette */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Alan Türleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fieldTypes.map(fieldType => {
              const Icon = fieldType.icon
              return (
                <Button
                  key={fieldType.type}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto p-3"
                  onClick={() => addField(fieldType.type as FormField['type'])}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{fieldType.label}</div>
                    <div className="text-xs text-gray-500">{fieldType.description}</div>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Form Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-64"
                placeholder="Form adı..."
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreviewMode ? 'Düzenle' : 'Önizle'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview?.(fields)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Canlı Önizle
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Kopyala
              </Button>
              <Button 
                size="sm"
                onClick={() => onSave?.(fields, formName)}
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>
        </div>

        {/* Form Builder Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{formName}</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-4 min-h-96"
                      >
                        {fields.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Form alanlarını buraya sürükleyin</p>
                            <p className="text-sm">Sol panelden alan türü seçerek başlayın</p>
                          </div>
                        ) : (
                          fields
                            .sort((a, b) => a.order - b.order)
                            .map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "transition-all",
                                      snapshot.isDragging && "opacity-50"
                                    )}
                                  >
                                    {isPreviewMode ? (
                                      renderFieldPreview(field)
                                    ) : (
                                      <div className="group">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedField(field)}
                                            className={cn(
                                              "flex-1 justify-start",
                                              selectedField?.id === field.id && "bg-blue-50"
                                            )}
                                          >
                                            {React.createElement(getFieldIcon(field.type), {
                                              className: "w-4 h-4 mr-2"
                                            })}
                                            {field.label}
                                          </Button>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => duplicateField(field)}
                                            >
                                              <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeField(field.id)}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        {selectedField?.id === field.id && (
                                          <Card className="mb-4">
                                            <CardContent className="p-4 space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label>Etiket</Label>
                                                  <Input
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                  />
                                                </div>
                                                <div>
                                                  <Label>Genişlik</Label>
                                                  <Select
                                                    value={field.width}
                                                    onValueChange={(value: any) => updateField(field.id, { width: value })}
                                                  >
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="full">Tam Genişlik</SelectItem>
                                                      <SelectItem value="half">Yarım Genişlik</SelectItem>
                                                      <SelectItem value="third">Üçte Bir</SelectItem>
                                                      <SelectItem value="quarter">Dörtte Bir</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>
                                              
                                              <div>
                                                <Label>Placeholder</Label>
                                                <Input
                                                  value={field.placeholder || ''}
                                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                />
                                              </div>
                                              
                                              <div>
                                                <Label>Yardım Metni</Label>
                                                <Input
                                                  value={field.helpText || ''}
                                                  onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                                                />
                                              </div>
                                              
                                              <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2">
                                                  <input
                                                    type="checkbox"
                                                    checked={field.required || false}
                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                  />
                                                  <span className="text-sm">Zorunlu Alan</span>
                                                </label>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}
                                        {renderFieldPreview(field)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}




















