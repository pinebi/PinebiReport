'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate?: string
  color: string
  priority: string
  isCompleted: boolean
  allDay: boolean
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onEventDrop?: (eventId: string, newDate: Date) => void
}

type ViewMode = 'month' | 'week' | 'day'

export function CalendarView({ events, onEventClick, onDateClick, onEventDrop }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []
    
    // Önceki ayın günleri
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Bu ayın günleri
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Sonraki ayın günleri (42 güne tamamla - 6 hafta)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const dayOfWeek = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      return day
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setDate(currentDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDragStart = (eventId: string) => {
    setDraggedEvent(eventId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (date: Date) => {
    if (draggedEvent && onEventDrop) {
      onEventDrop(draggedEvent, date)
      setDraggedEvent(null)
    }
  }

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-sm p-2 bg-gray-100 dark:bg-gray-800">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border ${
                day.isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer`}
              onClick={() => onDateClick && onDateClick(day.date)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day.date)}
            >
              <div className={`text-sm ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'} ${isToday ? 'font-bold' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(event.id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick && onEventClick(event)
                    }}
                    className="text-xs p-1 rounded truncate cursor-move hover:opacity-80"
                    style={{ backgroundColor: event.color, color: 'white' }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3} daha</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="flex">
        {/* Time column */}
        <div className="w-16 flex-shrink-0">
          <div className="h-12"></div>
          {hours.map(hour => (
            <div key={hour} className="h-16 border-b text-xs text-gray-500 pr-2 text-right pt-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div key={dayIndex} className="border-l">
                {/* Day header */}
                <div className={`h-12 p-2 text-center border-b ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
                  <div className="text-xs text-gray-500">
                    {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
                  </div>
                  <div className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Hours */}
                <div className="relative">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b"></div>
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const eventDate = new Date(event.startDate)
                    const topPosition = eventDate.getHours() * 64 + (eventDate.getMinutes() / 60) * 64

                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: event.color,
                          color: 'white',
                          top: `${topPosition}px`,
                          height: '60px'
                        }}
                        onClick={() => onEventClick && onEventClick(event)}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0">
          {hours.map(hour => (
            <div key={hour} className="h-20 border-b text-sm text-gray-500 pr-2 text-right pt-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="flex-1 relative border-l">
          {hours.map(hour => (
            <div key={hour} className="h-20 border-b"></div>
          ))}

          {dayEvents.map(event => {
            const eventDate = new Date(event.startDate)
            const topPosition = eventDate.getHours() * 80 + (eventDate.getMinutes() / 60) * 80

            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 p-2 rounded shadow-sm cursor-pointer hover:shadow-md"
                style={{
                  backgroundColor: event.color,
                  color: 'white',
                  top: `${topPosition}px`,
                  height: '75px'
                }}
                onClick={() => onEventClick && onEventClick(event)}
              >
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm opacity-90">
                  {eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Badge className="mt-1" variant="secondary">{event.priority}</Badge>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getViewTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate)
      return `${weekDays[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {getViewTitle()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Bugün
            </Button>
            <div className="flex border rounded">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Ay
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Hafta
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Gün
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            {renderWeekView()}
          </div>
        )}
        {viewMode === 'day' && (
          <div className="overflow-y-auto max-h-[600px]">
            {renderDayView()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



