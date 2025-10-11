'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Users, Filter, CheckCircle, AlertCircle, Star, Settings, BarChart3, Bot, Trello, GanttChart as GanttIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/calendar/calendar-view';
import { NotificationSettings } from '@/components/calendar/notification-settings';
import { ReportAutomation } from '@/components/calendar/report-automation';
import { MeetingManager } from '@/components/calendar/meeting-manager';
import { RoomReservation } from '@/components/calendar/room-reservation';
import { KanbanBoard } from '@/components/calendar/kanban-board';
import { GanttChart } from '@/components/calendar/gantt-chart';
import { AIScheduler } from '@/components/calendar/ai-scheduler';
import { CalendarAnalytics } from '@/components/calendar/calendar-analytics';
import { TeamAvailability } from '@/components/calendar/team-availability';
import { CalendarSync } from '@/components/calendar/calendar-sync';

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
  const [activeTab, setActiveTab] = useState('calendar');

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
          <h1 className="text-3xl font-bold">Takvim ve Proje Yönetimi</h1>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Takvim</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Ekip</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Toplantı</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Odalar</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-1">
            <Trello className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-1">
            <GanttIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Gantt</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Otomasyon</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analiz</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Ayarlar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarView
            events={events}
            onEventClick={(event) => console.log('Event clicked:', event)}
            onDateClick={(date) => console.log('Date clicked:', date)}
            onEventDrop={(eventId, newDate) => console.log('Event dropped:', eventId, newDate)}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIScheduler onEventCreate={(event) => console.log('AI created event:', event)} />
        </TabsContent>

        <TabsContent value="team">
          <TeamAvailability />
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingManager />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomReservation
            date={selectedDate}
            startTime="09:00"
            endTime="10:00"
            onRoomSelect={(room) => console.log('Room selected:', room)}
          />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="gantt">
          <GanttChart />
        </TabsContent>

        <TabsContent value="automation">
          <ReportAutomation />
        </TabsContent>

        <TabsContent value="analytics">
          <CalendarAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <CalendarSync />
            <NotificationSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
