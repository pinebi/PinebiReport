'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GanttTask {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  assignee: string
  dependencies: string[]
  color: string
  milestone?: boolean
}

export function GanttChart() {
  const [tasks] = useState<GanttTask[]>([
    {
      id: '1',
      name: 'Proje Planlama',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-05'),
      progress: 100,
      assignee: 'Ahmet Yılmaz',
      dependencies: [],
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Tasarım',
      startDate: new Date('2025-10-05'),
      endDate: new Date('2025-10-15'),
      progress: 75,
      assignee: 'Ayşe Demir',
      dependencies: ['1'],
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Backend Geliştirme',
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-25'),
      progress: 40,
      assignee: 'Mehmet Kaya',
      dependencies: ['2'],
      color: '#10b981'
    },
    {
      id: '4',
      name: 'Frontend Geliştirme',
      startDate: new Date('2025-10-12'),
      endDate: new Date('2025-10-28'),
      progress: 30,
      assignee: 'Fatma Özdemir',
      dependencies: ['2'],
      color: '#f59e0b'
    },
    {
      id: '5',
      name: 'Test',
      startDate: new Date('2025-10-26'),
      endDate: new Date('2025-11-05'),
      progress: 0,
      assignee: 'Ali Yıldız',
      dependencies: ['3', '4'],
      color: '#ef4444'
    },
    {
      id: '6',
      name: 'Yayına Alma',
      startDate: new Date('2025-11-05'),
      endDate: new Date('2025-11-05'),
      progress: 0,
      assignee: 'Takım',
      dependencies: ['5'],
      color: '#06b6d4',
      milestone: true
    }
  ])

  const [viewStart, setViewStart] = useState(new Date('2025-10-01'))
  const [viewDays, setViewDays] = useState(35)

  const getDaysBetween = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getTaskPosition = (task: GanttTask) => {
    const daysFromStart = getDaysBetween(viewStart, task.startDate)
    const taskDuration = getDaysBetween(task.startDate, task.endDate)
    return { left: daysFromStart, width: taskDuration || 1 }
  }

  const goToPreviousMonth = () => {
    const newStart = new Date(viewStart)
    newStart.setMonth(newStart.getMonth() - 1)
    setViewStart(newStart)
  }

  const goToNextMonth = () => {
    const newStart = new Date(viewStart)
    newStart.setMonth(newStart.getMonth() + 1)
    setViewStart(newStart)
  }

  const goToToday = () => {
    setViewStart(new Date())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gantt Chart - Proje Zaman Çizelgesi
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Bugün
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Timeline header */}
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {Array.from({ length: viewDays }, (_, i) => {
                const date = new Date(viewStart)
                date.setDate(date.getDate() + i)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[30px] text-center text-xs border-r ${
                      isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''
                    } ${isToday ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                  >
                    <div className="font-semibold">{date.getDate()}</div>
                    <div className="text-gray-500">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map(task => {
              const { left, width } = getTaskPosition(task)
              const isVisible = left < viewDays && left + width > 0

              return (
                <div key={task.id} className="flex items-center group">
                  {/* Task info */}
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      {task.milestone && (
                        <div className="w-3 h-3 bg-blue-500 rotate-45"></div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.name}</p>
                        <p className="text-xs text-gray-600">{task.assignee}</p>
                      </div>
                      <Badge className={`text-xs ${task.progress === 100 ? 'bg-green-500' : ''}`}>
                        {task.progress}%
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative h-12">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: viewDays }, (_, i) => {
                        const date = new Date(viewStart)
                        date.setDate(date.getDate() + i)
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6

                        return (
                          <div
                            key={i}
                            className={`flex-1 min-w-[30px] border-r ${
                              isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''
                            }`}
                          ></div>
                        )
                      })}
                    </div>

                    {/* Task bar */}
                    {isVisible && (
                      <div
                        className="absolute h-8 top-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-center text-white text-xs font-medium"
                        style={{
                          left: `${(Math.max(0, left) / viewDays) * 100}%`,
                          width: `${(Math.min(width, viewDays - left) / viewDays) * 100}%`,
                          backgroundColor: task.color,
                          minWidth: '40px'
                        }}
                      >
                        {task.milestone ? '◆' : `${task.progress}%`}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border"></div>
              <span>Hafta Sonu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rotate-45"></div>
              <span>Milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-green-500 rounded"></div>
              <span>Tamamlanan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-blue-500 rounded"></div>
              <span>Devam Eden</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



