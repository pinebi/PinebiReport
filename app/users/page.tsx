'use client'

import { useState, useEffect } from 'react'
import { EnhancedDataGrid } from '@/components/shared/enhanced-data-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Search, Plus } from 'lucide-react'
import { User, Company } from '@/types'
import { ColDef } from 'ag-grid-community'
import Link from 'next/link'

export default function UsersPage() {
  console.log('🔄 [USERS PAGE] Component rendering...')
  
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  console.log('🔄 [USERS PAGE] State initialized:', { usersCount: users.length, companiesCount: companies.length, loading })

  // Load data from API
  useEffect(() => {
    console.log('🔄 [USERS PAGE] useEffect triggered')
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔄 [USERS PAGE] Loading users and companies data...')
      
      // Load companies from API
      const companiesResponse = await fetch('/api/companies')
      const companiesData = await companiesResponse.json()
      console.log('📊 [USERS PAGE] Companies loaded:', companiesData.companies?.length || 0)
      console.log('📊 [USERS PAGE] Companies data:', companiesData.companies)
      setCompanies(companiesData.companies || [])
      
      // Load users from API
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      console.log('👥 [USERS PAGE] Users loaded:', usersData.users?.length || 0)
      console.log('👥 [USERS PAGE] Users data:', usersData.users)
      setUsers(usersData.users || [])
      
    } catch (error) {
      console.error('❌ [USERS PAGE] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }


  const columnDefs: ColDef[] = [
    { headerName: 'Kullanıcı Adı', field: 'username', width: 150 },
    { headerName: 'Ad', field: 'firstName', width: 120 },
    { headerName: 'Soyad', field: 'lastName', width: 120 },
    { headerName: 'E-posta', field: 'email', width: 200 },
    { 
      headerName: 'Firma', 
      field: 'company.name', 
      width: 180,
      valueGetter: (params) => params.data.company?.name || ''
    },
    { 
      headerName: 'Rol', 
      field: 'role', 
      width: 120,
      valueFormatter: (params) => {
        const roleMap = {
          'ADMIN': 'Yönetici',
          'REPORTER': 'Rapor Kullanıcısı'
        }
        return roleMap[params.value as keyof typeof roleMap] || params.value
      }
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
    },
    {
      headerName: 'İşlemler',
      width: 200,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(params.data)}
            className="text-blue-600 hover:text-blue-700"
          >
            Düzenle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(params.data)}
            className="text-red-600 hover:text-red-700"
          >
            Sil
          </Button>
        </div>
      )
    }
  ]

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm(`${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          loadData() // Reload data
        } else {
          alert('Kullanıcı silinirken hata oluştu')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Kullanıcı silinirken hata oluştu')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const password = (formData.get('password') as string) || ''
    const confirmPassword = (formData.get('confirmPassword') as string) || ''

    // For create: require password and confirm match. For edit: optional but must match when provided
    if (!editingUser) {
      if (!password) {
        alert('Lütfen şifre giriniz')
        return
      }
      if (password !== confirmPassword) {
        alert('Şifreler eşleşmiyor')
        return
      }
    } else {
      if ((password || confirmPassword) && password !== confirmPassword) {
        alert('Şifreler eşleşmiyor')
        return
      }
    }

    const userData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      companyId: formData.get('companyId') as string,
      role: formData.get('role') as 'ADMIN' | 'REPORTER',
      isActive: formData.get('isActive') === 'true',
      ...(password ? { password } : {})
    }

    try {
      let response
      if (editingUser) {
        // Update existing user
        response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      } else {
        // Add new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      }

      if (response.ok) {
        loadData() // Reload data
        setShowForm(false)
        setEditingUser(null)
      } else {
        alert('Kullanıcı kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Kullanıcı kaydedilirken hata oluştu')
    }
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
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
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    required 
                    defaultValue={editingUser?.firstName || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    required 
                    defaultValue={editingUser?.lastName || ''}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="username">Kullanıcı Adı *</Label>
                <Input 
                  id="username" 
                  name="username" 
                  required 
                  defaultValue={editingUser?.username || ''}
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  defaultValue={editingUser?.email || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Şifre {editingUser ? '(opsiyonel)' : '*'}</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder={editingUser ? 'Boş bırakılırsa değişmez' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Şifre (Tekrar) {editingUser ? '(opsiyonel)' : '*'}</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyId">Firma *</Label>
                <select 
                  id="companyId" 
                  name="companyId" 
                  required 
                  defaultValue={editingUser?.companyId || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Firma Seçin</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="role">Rol *</Label>
                <select 
                  id="role" 
                  name="role" 
                  required 
                  defaultValue={editingUser?.role || 'REPORTER'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="REPORTER">Rapor Kullanıcısı</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="isActive">Durum</Label>
                <select 
                  id="isActive" 
                  name="isActive" 
                  defaultValue={editingUser?.isActive ? 'true' : 'false'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingUser ? 'Güncelle' : 'Kaydet'}
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Kullanıcı Ekle
          </Button>
        </div>
      </div>

      <EnhancedDataGrid
        key={`users-grid-${filteredUsers.length}-${loading}`}
        data={filteredUsers}
        columnDefs={columnDefs}
        title={`Kullanıcılar (${filteredUsers.length})`}
        gridType="users-management"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}
