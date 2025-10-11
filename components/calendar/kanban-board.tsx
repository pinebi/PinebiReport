'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical, Calendar, User, MessageSquare } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  assignee?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  comments: number
  attachments: number
}

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'Yapılacak',
      color: 'bg-gray-100',
      tasks: [
        {
          id: '1',
          title: 'Satış raporunu hazırla',
          description: 'Aylık satış raporunu Excel olarak hazırla',
          assignee: 'Ahmet Yılmaz',
          dueDate: new Date('2025-10-10'),
          priority: 'high',
          tags: ['Rapor', 'Satış'],
          comments: 2,
          attachments: 0
        },
        {
          id: '2',
          title: 'Dashboard tasarımı güncelle',
          assignee: 'Ayşe Demir',
          dueDate: new Date('2025-10-12'),
          priority: 'medium',
          tags: ['UI/UX', 'Dashboard'],
          comments: 0,
          attachments: 1
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'Devam Ediyor',
      color: 'bg-blue-100',
      tasks: [
        {
          id: '3',
          title: 'API entegrasyonu',
          description: 'Pinebi API ile entegrasyon',
          assignee: 'Mehmet Kaya',
          dueDate: new Date('2025-10-09'),
          priority: 'urgent',
          tags: ['Backend', 'API'],
          comments: 5,
          attachments: 2
        }
      ]
    },
    {
      id: 'review',
      title: 'İnceleme',
      color: 'bg-yellow-100',
      tasks: [
        {
          id: '4',
          title: 'Kullanıcı testi',
          assignee: 'Fatma Özdemir',
          priority: 'medium',
          tags: ['Test', 'QA'],
          comments: 3,
          attachments: 0
        }
      ]
    },
    {
      id: 'done',
      title: 'Tamamlandı',
      color: 'bg-green-100',
      tasks: [
        {
          id: '5',
          title: 'Database optimizasyonu',
          assignee: 'Ali Yıldız',
          priority: 'high',
          tags: ['Database', 'Performance'],
          comments: 1,
          attachments: 3
        }
      ]
    }
  ])

  const [draggedTask, setDraggedTask] = useState<{ taskId: string; columnId: string } | null>(null)

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTask({ taskId, columnId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return

    const sourceColumn = columns.find(col => col.id === draggedTask.columnId)
    const targetColumn = columns.find(col => col.id === targetColumnId)

    if (!sourceColumn || !targetColumn) return

    const task = sourceColumn.tasks.find(t => t.id === draggedTask.taskId)
    if (!task) return

    setColumns(prev =>
      prev.map(col => {
        if (col.id === draggedTask.columnId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.taskId) }
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, task] }
        }
        return col
      })
    )

    setDraggedTask(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Acil'
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
      default: return priority
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="space-y-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <Card className={column.color}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="secondary">{column.tasks.length}</Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {column.tasks.map(task => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id, column.id)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>

                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>

                      <div className="flex items-center gap-2 text-gray-600">
                        {task.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {task.comments}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {task.assignee && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Görev Ekle
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



