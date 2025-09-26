'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Tag,
  DollarSign,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  code: string
  name: string
  description?: string
  category?: {
    id: string
    name: string
  }
  price: number
  cost: number
  stock: number
  minStock: number
  maxStock: number
  unit: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProductCategory {
  id: string
  name: string
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadProducts()
      loadCategories()
    }
  }, [user, searchTerm, selectedCategory, sortBy, sortOrder])

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && { categoryId: selectedCategory }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/product-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        loadProducts()
      } else {
        alert('Ürün silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ürün silinirken hata oluştu')
    }
  }

  const getStockStatus = (stock: number, minStock: number, maxStock: number) => {
    if (stock <= 0) {
      return { label: 'Stok Yok', color: 'bg-red-100 text-red-800' }
    } else if (stock <= minStock) {
      return { label: 'Stok Az', color: 'bg-yellow-100 text-yellow-800' }
    } else if (stock >= maxStock) {
      return { label: 'Stok Fazla', color: 'bg-blue-100 text-blue-800' }
    } else {
      return { label: 'Normal', color: 'bg-green-100 text-green-800' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Ürün Yönetimi
          </h1>
          <p className="text-gray-600 mt-1">Ürünlerinizi yönetin ve takip edin</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ürün
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Aktif ürün sayısı
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Toplam kategori
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Uyarısı</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock <= p.minStock).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Düşük stok ürün
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Fiyat</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ortalama ürün fiyatı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Ürün ara (kod, ad, açıklama)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">İsim</SelectItem>
                <SelectItem value="code">Kod</SelectItem>
                <SelectItem value="price">Fiyat</SelectItem>
                <SelectItem value="stock">Stok</SelectItem>
                <SelectItem value="createdAt">Tarih</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <TrendingUp className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Kod</th>
                  <th className="text-left p-3">Ürün Adı</th>
                  <th className="text-left p-3">Kategori</th>
                  <th className="text-left p-3">Fiyat</th>
                  <th className="text-left p-3">Stok</th>
                  <th className="text-left p-3">Durum</th>
                  <th className="text-left p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const stockStatus = getStockStatus(product.stock, product.minStock, product.maxStock)
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{product.code}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {product.category ? (
                          <Badge variant="outline">{product.category.name}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">₺{product.price.toLocaleString('tr-TR')}</div>
                        <div className="text-sm text-gray-500">Maliyet: ₺{product.cost.toLocaleString('tr-TR')}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{product.stock} {product.unit}</div>
                        <div className="text-sm text-gray-500">
                          Min: {product.minStock} | Max: {product.maxStock}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz ürün bulunmuyor</p>
                <p className="text-sm">Yeni ürün eklemek için yukarıdaki butonu kullanın</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yeni Ürün Ekle</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ürün adını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button 
                  type="submit"
                  className="flex-1"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


