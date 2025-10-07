'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Key,
  Mail,
  Phone,
  Building,
  Calendar,
  Activity,
  Lock,
  Unlock,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'REPORTER' | 'VIEWER'
  department: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  permissions: string[]
  company: string
  phone?: string
  avatar?: string
}

const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@pinebi.com',
    firstName: 'Sistem',
    lastName: 'Yöneticisi',
    role: 'ADMIN',
    department: 'IT',
    isActive: true,
    lastLogin: '2025-10-04 14:30',
    createdAt: '2025-09-01',
    permissions: ['all'],
    company: 'Pinebi',
    phone: '+90 555 123 4567'
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@pinebi.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    role: 'MANAGER',
    department: 'Satış',
    isActive: true,
    lastLogin: '2025-10-04 13:45',
    createdAt: '2025-09-15',
    permissions: ['reports', 'users', 'analytics'],
    company: 'RMK',
    phone: '+90 555 234 5678'
  },
  {
    id: '3',
    username: 'reporter',
    email: 'reporter@company.com',
    firstName: 'Rapor',
    lastName: 'Kullanıcısı',
    role: 'REPORTER',
    department: 'Finans',
    isActive: true,
    lastLogin: '2025-10-04 12:15',
    createdAt: '2025-09-18',
    permissions: ['reports', 'export'],
    company: 'RMK'
  },
  {
    id: '4',
    username: 'viewer',
    email: 'viewer@company.com',
    firstName: 'Fatma',
    lastName: 'Demir',
    role: 'VIEWER',
    department: 'Pazarlama',
    isActive: false,
    lastLogin: '2025-09-28 16:20',
    createdAt: '2025-09-20',
    permissions: ['view'],
    company: 'RMK',
    phone: '+90 555 345 6789'
  }
]

const roles = [
  { 
    value: 'ADMIN', 
    label: 'Sistem Yöneticisi', 
    icon: <Crown className="w-4 h-4 text-yellow-600" />, 
    description: 'Tam erişim',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    value: 'MANAGER', 
    label: 'Yönetici', 
    icon: <Shield className="w-4 h-4 text-blue-600" />, 
    description: 'Yönetim yetkileri',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'REPORTER', 
    label: 'Rapor Kullanıcısı', 
    icon: <UserCheck className="w-4 h-4 text-green-600" />, 
    description: 'Rapor oluşturma',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'VIEWER', 
    label: 'Görüntüleyici', 
    icon: <Eye className="w-4 h-4 text-gray-600" />, 
    description: 'Sadece görüntüleme',
    color: 'bg-gray-100 text-gray-800'
  }
]

const departments = ['IT', 'Satış', 'Finans', 'Pazarlama', 'İnsan Kaynakları', 'Operasyon']
const companies = ['Pinebi', 'RMK', 'BELPAS', 'Diğer']

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'VIEWER',
    department: '',
    company: '',
    phone: ''
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.isActive) ||
      (selectedStatus === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = () => {
    console.log('Creating new user:', newUser)
    // Burada yeni kullanıcı oluşturma logic'i olacak
  }

  const toggleUserStatus = (userId: string) => {
    console.log('Toggling user status:', userId)
    // Burada kullanıcı durumu değiştirme logic'i olacak
  }

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[3]
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Kullanıcı Yönetimi
        </h1>
        <p className="text-gray-600">
          Kullanıcıları yönetin, roller atayın ve izinleri kontrol edin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roller
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            İzinler
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setActiveTab('add-user')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role)
              return (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-gray-600">@{user.username}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {user.company}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${roleInfo.color}`}>
                            {roleInfo.icon}
                            {roleInfo.label}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm text-gray-600">
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Son giriş: {user.lastLogin}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {role.icon}
                    {role.label}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Kullanıcı Sayısı:</span>
                      <span className="font-medium">
                        {users.filter(u => u.role === role.value).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>İzinler:</span>
                      <span className="font-medium">
                        {role.value === 'ADMIN' ? 'Tümü' : 
                         role.value === 'MANAGER' ? 'Yönetim' :
                         role.value === 'REPORTER' ? 'Raporlar' : 'Görüntüleme'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İzin Matrisi</CardTitle>
              <p className="text-sm text-gray-600">Hangi rolün hangi işlemleri yapabileceğini belirleyin</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">İzin</th>
                      <th className="text-center p-3">Admin</th>
                      <th className="text-center p-3">Yönetici</th>
                      <th className="text-center p-3">Rapor Kullanıcısı</th>
                      <th className="text-center p-3">Görüntüleyici</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { permission: 'Dashboard Görüntüleme', admin: true, manager: true, reporter: true, viewer: true },
                      { permission: 'Rapor Oluşturma', admin: true, manager: true, reporter: true, viewer: false },
                      { permission: 'Rapor Silme', admin: true, manager: true, reporter: false, viewer: false },
                      { permission: 'Kullanıcı Yönetimi', admin: true, manager: true, reporter: false, viewer: false },
                      { permission: 'Sistem Ayarları', admin: true, manager: false, reporter: false, viewer: false },
                      { permission: 'Veri Export', admin: true, manager: true, reporter: true, viewer: false },
                      { permission: 'API Erişimi', admin: true, manager: true, reporter: true, viewer: false }
                    ].map((perm, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{perm.permission}</td>
                        <td className="text-center p-3">
                          <input type="checkbox" checked={perm.admin} className="rounded" />
                        </td>
                        <td className="text-center p-3">
                          <input type="checkbox" checked={perm.manager} className="rounded" />
                        </td>
                        <td className="text-center p-3">
                          <input type="checkbox" checked={perm.reporter} className="rounded" />
                        </td>
                        <td className="text-center p-3">
                          <input type="checkbox" checked={perm.viewer} className="rounded" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>İki faktörlü kimlik doğrulama</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Oturum zaman aşımı (dakika)</span>
                  <Input type="number" defaultValue="30" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Maksimum başarısız giriş</span>
                  <Input type="number" defaultValue="5" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Şifre karmaşıklığı</span>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Yeni kullanıcı bildirimleri</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Başarısız giriş bildirimleri</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Rol değişiklik bildirimleri</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Haftalık aktivite raporu</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Kullanıcı Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                    <Input
                      placeholder="kullaniciadi"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-posta</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad</label>
                    <Input
                      placeholder="Ad"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Soyad</label>
                    <Input
                      placeholder="Soyad"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rol</label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              {role.icon}
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Departman</label>
                    <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Departman seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Şirket</label>
                    <Select value={newUser.company} onValueChange={(value) => setNewUser({...newUser, company: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Şirket seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <Input
                      placeholder="+90 555 123 4567"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={handleCreateUser}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Kullanıcı Oluştur
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('users')}>
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}






