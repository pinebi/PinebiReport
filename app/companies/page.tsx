'use client'

import { useState, useEffect } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Company } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load companies from API
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnDefs: ColDef[] = [
    { headerName: 'Firma Kodu', field: 'code', width: 120 },
    { headerName: 'Firma Adı', field: 'name', width: 200 },
    { headerName: 'Adres', field: 'address', width: 180 },
    { headerName: 'Telefon', field: 'phone', width: 150 },
    { headerName: 'E-posta', field: 'email', width: 180 },
    { headerName: 'Vergi No', field: 'taxNumber', width: 120 },
    { 
      headerName: 'Oluşturma Tarihi', 
      field: 'createdAt', 
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR')
    }
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCompany(null)
    setShowForm(true)
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setShowForm(true)
  }

  const handleDelete = async (company: Company) => {
    if (confirm(`${company.name} firmasını silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/companies/${company.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          loadCompanies() // Reload data
        } else {
          alert('Firma silinirken hata oluştu')
        }
      } catch (error) {
        console.error('Error deleting company:', error)
        alert('Firma silinirken hata oluştu')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const companyData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      taxNumber: formData.get('taxNumber') as string,
    }

    try {
      let response
      if (editingCompany) {
        // Update existing company
        response = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        })
      } else {
        // Add new company
        response = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        })
      }

      if (response.ok) {
        loadCompanies() // Reload data
        setShowForm(false)
        setEditingCompany(null)
      } else {
        alert('Firma kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      alert('Firma kaydedilirken hata oluştu')
    }
  }

  if (showForm) {
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
                {editingCompany ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Firma Kodu *</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    required 
                    defaultValue={editingCompany?.code || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Firma Adı *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={editingCompany?.name || ''}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adres</Label>
                <Input 
                  id="address" 
                  name="address" 
                  defaultValue={editingCompany?.address || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    defaultValue={editingCompany?.phone || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    defaultValue={editingCompany?.email || ''}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="taxNumber">Vergi Numarası</Label>
                <Input 
                  id="taxNumber" 
                  name="taxNumber" 
                  defaultValue={editingCompany?.taxNumber || ''}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCompany ? 'Güncelle' : 'Kaydet'}
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
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Firma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Firma Ekle
          </Button>
        </div>
      </div>

      <EnhancedDataGrid
        data={filteredCompanies}
        columnDefs={columnDefs}
        title={`Firmalar (${filteredCompanies.length})`}
        gridType="companies-management"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
