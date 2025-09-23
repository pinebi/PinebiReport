'use client'

import { useState, useEffect } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, FolderTree, Folder, FolderPlus } from 'lucide-react'
import { ReportCategory } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function ReportCategoriesPage() {
  const [categories, setCategories] = useState<ReportCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ReportCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load categories from API
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/report-categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnDefs: ColDef[] = [
    { 
      headerName: 'Kategori', 
      field: 'name', 
      width: 250,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const category = params.data as ReportCategory
        const isParent = !category.parentId
        const level = category.parentId ? 1 : 0
        
        return (
          <div className={`flex items-center gap-2 ${level > 0 ? 'ml-6' : ''}`}>
            {category.icon && <span className="text-lg">{category.icon}</span>}
            {isParent ? (
              <FolderTree className="w-4 h-4 text-blue-600" />
            ) : (
              <Folder className="w-4 h-4 text-orange-600" />
            )}
            <span className={`${isParent ? 'font-semibold' : ''}`}>
              {category.name}
            </span>
          </div>
        )
      }
    },
    { headerName: 'Açıklama', field: 'description', width: 300 },
    { 
      headerName: 'Üst Kategori', 
      field: 'parent.name', 
      width: 150,
      valueGetter: (params) => params.data.parent?.name || 'Ana Kategori'
    },
    { 
      headerName: 'Renk', 
      field: 'color', 
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: params.value }}
          ></div>
          <span className="text-xs">{params.value}</span>
        </div>
      )
    },
    { 
      headerName: 'Sıra', 
      field: 'sortOrder', 
      width: 80,
      type: 'numericColumn'
    },
    { 
      headerName: 'Alt Kategori Sayısı', 
      field: 'children.length', 
      width: 150,
      valueGetter: (params) => params.data.children?.length || 0
    },
    { 
      headerName: 'Durum', 
      field: 'isActive', 
      width: 100,
      valueFormatter: (params) => params.value ? 'Aktif' : 'Pasif',
      cellStyle: (params) => ({
        color: params.value ? '#16a34a' : '#dc2626',
        fontWeight: 'bold'
      })
    },
    { 
      headerName: 'Oluşturma Tarihi', 
      field: 'createdAt', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR')
    }
  ]

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEdit = (category: ReportCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (category: ReportCategory) => {
    if (category.children && category.children.length > 0) {
      alert('Alt kategorileri olan kategori silinemez!')
      return
    }
    
    if (confirm(`${category.name} kategorisini silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/report-categories/${category.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          loadCategories() // Reload data
          // Sidebar'ı güncellemek için custom event tetikle
          window.dispatchEvent(new CustomEvent('refreshSidebar'))
          console.log('Kategori başarıyla silindi!')
        } else {
          alert('Kategori silinirken hata oluştu')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Kategori silinirken hata oluştu')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: formData.get('parentId') as string || undefined,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      sortOrder: parseInt(formData.get('sortOrder') as string) || 1,
      isActive: formData.get('isActive') === 'true',
    }

    try {
      let response
      if (editingCategory) {
        // Update existing category
        response = await fetch(`/api/report-categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
      } else {
        // Add new category
        response = await fetch('/api/report-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
      }

      if (response.ok) {
        loadCategories() // Reload data
        setShowForm(false)
        setEditingCategory(null)
        
        // Sidebar'ı güncellemek için custom event tetikle
        window.dispatchEvent(new CustomEvent('refreshSidebar'))
        
        console.log(editingCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!')
      } else {
        alert('Kategori kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Kategori kaydedilirken hata oluştu')
    }
  }

  if (showForm) {
    const parentCategories = categories.filter(c => !c.parentId)
    
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={editingCategory?.name || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Input 
                  id="description" 
                  name="description" 
                  defaultValue={editingCategory?.description || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="parentId">Üst Kategori</Label>
                <select 
                  id="parentId" 
                  name="parentId" 
                  defaultValue={editingCategory?.parentId || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Ana Kategori</option>
                  {parentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">İkon (Emoji)</Label>
                  <Input 
                    id="icon" 
                    name="icon" 
                    defaultValue={editingCategory?.icon || '📊'}
                    placeholder="📊"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Renk</Label>
                  <Input 
                    id="color" 
                    name="color" 
                    type="color"
                    defaultValue={editingCategory?.color || '#3B82F6'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortOrder">Sıra Numarası</Label>
                  <Input 
                    id="sortOrder" 
                    name="sortOrder" 
                    type="number"
                    defaultValue={editingCategory?.sortOrder || 1}
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Durum</Label>
                  <select 
                    id="isActive" 
                    name="isActive" 
                    defaultValue={editingCategory?.isActive ? 'true' : 'false'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCategory ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Rapor Kategorileri</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700">
            <FolderPlus className="w-4 h-4 mr-2" />
            Kategori Ekle
          </Button>
        </div>
      </div>

      <EnhancedDataGrid
        data={filteredCategories}
        columnDefs={columnDefs}
        title={`Rapor Kategorileri (${filteredCategories.length})`}
        gridType="report-categories"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
