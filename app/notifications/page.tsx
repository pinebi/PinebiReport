'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellOff, 
  Settings, 
  Send, 
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Archive,
  MarkAsRead,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Activity,
  Shield,
  Database,
  Download
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  isArchived: boolean
  createdAt: string
  expiresAt?: string
  category: string
  sender?: string
  actions?: string[]
  metadata?: any
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Yeni Rapor Oluşturuldu',
    message: 'Satış Raporu Ekim 2025 başarıyla oluşturuldu ve hazır.',
    type: 'success',
    priority: 'medium',
    isRead: false,
    isArchived: false,
    createdAt: '2025-10-04 14:30',
    category: 'Rapor',
    sender: 'Sistem',
    actions: ['Görüntüle', 'İndir']
  },
  {
    id: '2',
    title: 'API Bağlantı Sorunu',
    message: 'Pinebi API bağlantısında geçici sorun yaşanıyor. Lütfen tekrar deneyin.',
    type: 'error',
    priority: 'high',
    isRead: false,
    isArchived: false,
    createdAt: '2025-10-04 13:45',
    category: 'Sistem',
    sender: 'Sistem',
    actions: ['Yeniden Dene', 'Detay']
  },
  {
    id: '3',
    title: 'Yeni Kullanıcı Eklendi',
    message: 'Ahmet Yılmaz sisteme yönetici olarak eklendi.',
    type: 'info',
    priority: 'low',
    isRead: true,
    isArchived: false,
    createdAt: '2025-10-04 12:15',
    category: 'Kullanıcı',
    sender: 'Admin'
  },
  {
    id: '4',
    title: 'Veri Export Tamamlandı',
    message: 'Satış verileri Excel formatında başarıyla export edildi.',
    type: 'success',
    priority: 'medium',
    isRead: true,
    isArchived: false,
    createdAt: '2025-10-04 11:30',
    category: 'Export',
    sender: 'Sistem',
    actions: ['İndir']
  },
  {
    id: '5',
    title: 'Güvenlik Uyarısı',
    message: 'Şüpheli giriş denemesi tespit edildi. IP: 192.168.1.100',
    type: 'warning',
    priority: 'urgent',
    isRead: false,
    isArchived: false,
    createdAt: '2025-10-04 10:20',
    category: 'Güvenlik',
    sender: 'Sistem',
    actions: ['Engelle', 'Detay']
  },
  {
    id: '6',
    title: 'Sistem Güncellemesi',
    message: 'Yeni özellikler ve hata düzeltmeleri mevcut. Güncellemeyi planlayın.',
    type: 'info',
    priority: 'medium',
    isRead: false,
    isArchived: false,
    createdAt: '2025-10-03 16:45',
    category: 'Sistem',
    sender: 'Geliştirici'
  }
]

const notificationTypes = [
  { value: 'info', label: 'Bilgi', icon: <Info className="w-4 h-4 text-blue-600" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'success', label: 'Başarı', icon: <CheckCircle className="w-4 h-4 text-green-600" />, color: 'bg-green-100 text-green-800' },
  { value: 'warning', label: 'Uyarı', icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'error', label: 'Hata', icon: <AlertCircle className="w-4 h-4 text-red-600" />, color: 'bg-red-100 text-red-800' },
  { value: 'system', label: 'Sistem', icon: <Shield className="w-4 h-4 text-gray-600" />, color: 'bg-gray-100 text-gray-800' }
]

const priorities = [
  { value: 'low', label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Orta', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Yüksek', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: 'Acil', color: 'bg-red-100 text-red-800' }
]

const categories = ['Tümü', 'Sistem', 'Rapor', 'Kullanıcı', 'Güvenlik', 'Export', 'API']

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    category: 'Sistem',
    recipients: []
  })

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || notification.type === selectedType
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority
    const matchesCategory = selectedCategory === 'Tümü' || notification.category === selectedCategory
    
    const matchesTab = 
      (activeTab === 'all' && !notification.isArchived) ||
      (activeTab === 'unread' && !notification.isRead && !notification.isArchived) ||
      (activeTab === 'archived' && notification.isArchived)
    
    return matchesSearch && matchesType && matchesPriority && matchesCategory && matchesTab
  })

  const markAsRead = (id: string) => {
    console.log('Marking as read:', id)
  }

  const archiveNotification = (id: string) => {
    console.log('Archiving notification:', id)
  }

  const deleteNotification = (id: string) => {
    console.log('Deleting notification:', id)
  }

  const sendNotification = () => {
    console.log('Sending notification:', newNotification)
  }

  const getTypeInfo = (type: string) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1]
  }

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length
  const archivedCount = notifications.filter(n => n.isArchived).length

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          Bildirim Merkezi
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Sistem bildirimlerini yönetin ve yeni bildirimler gönderin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Tümü
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <BellOff className="w-4 h-4" />
            Okunmamış
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Arşivlenmiş
            {archivedCount > 0 && (
              <span className="bg-gray-500 text-white text-xs px-1 py-0.5 rounded-full">
                {archivedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Bildirim Gönder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Bildirim ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const typeInfo = getTypeInfo(notification.type)
              const priorityInfo = getPriorityInfo(notification.priority)
              
              return (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-lg transition-all ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {notification.category}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notification.createdAt}
                            </span>
                            {notification.sender && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {notification.sender}
                              </span>
                            )}
                          </div>
                          {notification.actions && (
                            <div className="flex gap-2 mt-3">
                              {notification.actions.map((action, index) => (
                                <Button key={index} size="sm" variant="outline">
                                  {action}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {!notification.isRead && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <MarkAsRead className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => archiveNotification(notification.id)}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-6">
          <div className="text-center py-8">
            <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Okunmamış bildirim yok</h3>
            <p className="text-gray-500">Tüm bildirimlerinizi okudunuz.</p>
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-6">
          <div className="text-center py-8">
            <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Arşivlenmiş bildirim yok</h3>
            <p className="text-gray-500">Henüz arşivlenmiş bildirim bulunmuyor.</p>
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Bildirim Gönder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Başlık</label>
                    <Input
                      placeholder="Bildirim başlığı"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mesaj</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows={4}
                      placeholder="Bildirim mesajı"
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tür</label>
                    <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Öncelik</label>
                    <Select value={newNotification.priority} onValueChange={(value) => setNewNotification({...newNotification, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategori</label>
                    <Select value={newNotification.category} onValueChange={(value) => setNewNotification({...newNotification, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={sendNotification}>
                  <Send className="w-4 h-4 mr-2" />
                  Bildirim Gönder
                </Button>
                <Button variant="outline">
                  Önizleme
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı Bildirimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Database className="w-6 h-6 mb-2" />
                  <span className="text-sm">Sistem Durumu</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Activity className="w-6 h-6 mb-2" />
                  <span className="text-sm">Performans</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Shield className="w-6 h-6 mb-2" />
                  <span className="text-sm">Güvenlik</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Rapor Hazır</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="w-6 h-6 mb-2" />
                  <span className="text-sm">Export Tamamlandı</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <User className="w-6 h-6 mb-2" />
                  <span className="text-sm">Yeni Kullanıcı</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}













