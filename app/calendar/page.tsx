'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Users, Filter, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  color: string;
  priority: string;
  category?: string;
  isCompleted: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  reminders: Array<{
    id: string;
    title: string;
    reminderDate: string;
    isCompleted: boolean;
    priority: string;
  }>;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  isCompleted: boolean;
  priority: string;
  category?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  calendarEvent?: {
    id: string;
    title: string;
    startDate: string;
    endDate?: string;
  };
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCompleted, setFilterCompleted] = useState<string>('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateReminder, setShowCreateReminder] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    // Mock events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Takım Toplantısı',
        description: 'Haftalık takım toplantısı',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T11:00:00Z',
        allDay: false,
        location: 'Toplantı Odası A',
        color: '#3b82f6',
        priority: 'HIGH',
        category: 'Meeting',
        isCompleted: false,
        createdBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          username: 'ahmet'
        },
        assignedTo: {
          id: '2',
          firstName: 'Ayşe',
          lastName: 'Demir',
          username: 'ayse'
        },
        reminders: []
      },
      {
        id: '2',
        title: 'Proje Teslimi',
        description: 'Yeni proje teslim tarihi',
        startDate: '2024-01-20T17:00:00Z',
        endDate: '2024-01-20T18:00:00Z',
        allDay: false,
        color: '#ef4444',
        priority: 'URGENT',
        category: 'Deadline',
        isCompleted: false,
        createdBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          username: 'ahmet'
        },
        reminders: []
      }
    ];

    // Mock reminders
    const mockReminders: Reminder[] = [
      {
        id: '1',
        title: 'Toplantı hazırlığı',
        description: 'Sunum dosyalarını hazırla',
        reminderDate: '2024-01-15T09:00:00Z',
        isCompleted: false,
        priority: 'MEDIUM',
        category: 'Work',
        createdBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          username: 'ahmet'
        },
        assignedTo: {
          id: '2',
          firstName: 'Ayşe',
          lastName: 'Demir',
          username: 'ayse'
        }
      },
      {
        id: '2',
        title: 'Fatura ödeme',
        description: 'Elektrik faturası ödeme tarihi',
        reminderDate: '2024-01-18T10:00:00Z',
        isCompleted: true,
        priority: 'HIGH',
        category: 'Personal',
        createdBy: {
          id: '1',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          username: 'ahmet'
        }
      }
    ];

    // Mock users
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'ahmet',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@company.com',
        role: 'ADMIN'
      },
      {
        id: '2',
        username: 'ayse',
        firstName: 'Ayşe',
        lastName: 'Demir',
        email: 'ayse@company.com',
        role: 'USER'
      }
    ];

    setEvents(mockEvents);
    setReminders(mockReminders);
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <AlertCircle className="w-4 h-4" />;
      case 'HIGH': return <Star className="w-4 h-4" />;
      case 'MEDIUM': return <Clock className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    if (filterUser !== 'all' && event.assignedTo?.id !== filterUser && event.createdBy.id !== filterUser) return false;
    if (filterPriority !== 'all' && event.priority !== filterPriority) return false;
    if (filterCompleted !== 'all') {
      const isCompleted = event.isCompleted;
      if (filterCompleted === 'completed' && !isCompleted) return false;
      if (filterCompleted === 'pending' && isCompleted) return false;
    }
    return true;
  });

  const filteredReminders = reminders.filter(reminder => {
    if (filterUser !== 'all' && reminder.assignedTo?.id !== filterUser && reminder.createdBy.id !== filterUser) return false;
    if (filterPriority !== 'all' && reminder.priority !== filterPriority) return false;
    if (filterCompleted !== 'all') {
      const isCompleted = reminder.isCompleted;
      if (filterCompleted === 'completed' && !isCompleted) return false;
      if (filterCompleted === 'pending' && isCompleted) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Takvim ve Hatırlatmalar</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Etkinlik Ekle
          </Button>
          <Button onClick={() => setShowCreateReminder(true)} variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Hatırlatma Ekle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtreler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kullanıcı</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Kullanıcı seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Öncelik</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="LOW">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durum</label>
              <Select value={filterCompleted} onValueChange={setFilterCompleted}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekleyen</SelectItem>
                  <SelectItem value="completed">Tamamlanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tarih</label>
              <Input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Takvim Etkinlikleri ({filteredEvents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge className={`${getPriorityColor(event.priority)} text-white`}>
                        {event.priority}
                      </Badge>
                      {event.isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Tamamlandı
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(event.startDate)}</span>
                      {event.endDate && <span>- {formatDate(event.endDate)}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Oluşturan: {event.createdBy.firstName} {event.createdBy.lastName}</span>
                    {event.assignedTo && (
                      <span>Atanan: {event.assignedTo.firstName} {event.assignedTo.lastName}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(event.priority)}
                    <span>{event.category}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Filtrelere uygun etkinlik bulunamadı.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Hatırlatmalar ({filteredReminders.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReminders.map(reminder => (
              <div key={reminder.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{reminder.title}</h3>
                      <Badge className={`${getPriorityColor(reminder.priority)} text-white`}>
                        {reminder.priority}
                      </Badge>
                      {reminder.isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Tamamlandı
                        </Badge>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>📅 {formatDate(reminder.reminderDate)}</span>
                      {reminder.category && <span>🏷️ {reminder.category}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Oluşturan: {reminder.createdBy.firstName} {reminder.createdBy.lastName}</span>
                    {reminder.assignedTo && (
                      <span>Atanan: {reminder.assignedTo.firstName} {reminder.assignedTo.lastName}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(reminder.priority)}
                    {reminder.calendarEvent && (
                      <span>📅 {reminder.calendarEvent.title}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredReminders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Filtrelere uygun hatırlatma bulunamadı.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
