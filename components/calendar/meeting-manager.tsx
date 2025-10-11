'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MapPin, 
  Video, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Trash2 
} from 'lucide-react'

interface Participant {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  role: 'organizer' | 'required' | 'optional'
}

interface MeetingNote {
  id: string
  content: string
  createdBy: string
  createdAt: Date
}

interface AgendaItem {
  id: string
  title: string
  duration: number
  presenter?: string
  isCompleted: boolean
}

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  equipment: string[]
  isAvailable: boolean
}

interface Meeting {
  id: string
  title: string
  startTime: Date
  endTime: Date
  participants: Participant[]
  room?: MeetingRoom
  videoLink?: string
  agenda: AgendaItem[]
  notes: MeetingNote[]
  description?: string
}

export function MeetingManager({ meetingId }: { meetingId?: string }) {
  const [meeting, setMeeting] = useState<Meeting>({
    id: meetingId || 'new',
    title: 'Haftalık Takım Toplantısı',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    participants: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@company.com',
        status: 'accepted',
        role: 'organizer'
      },
      {
        id: '2',
        name: 'Ayşe Demir',
        email: 'ayse@company.com',
        status: 'pending',
        role: 'required'
      },
      {
        id: '3',
        name: 'Mehmet Kaya',
        email: 'mehmet@company.com',
        status: 'accepted',
        role: 'optional'
      }
    ],
    room: {
      id: 'room_1',
      name: 'Toplantı Odası A',
      capacity: 10,
      equipment: ['Projeksiyon', 'Beyaz Tahta', 'Video Konferans'],
      isAvailable: true
    },
    videoLink: 'https://meet.google.com/abc-defg-hij',
    agenda: [
      { id: '1', title: 'Geçen hafta değerlendirmesi', duration: 15, presenter: 'Ahmet Yılmaz', isCompleted: false },
      { id: '2', title: 'Yeni proje planlaması', duration: 30, presenter: 'Ayşe Demir', isCompleted: false },
      { id: '3', title: 'Soru & Cevap', duration: 15, isCompleted: false }
    ],
    notes: [],
    description: 'Haftalık rutin takım toplantısı'
  })

  const [newAgendaItem, setNewAgendaItem] = useState({ title: '', duration: 15, presenter: '' })
  const [newNote, setNewNote] = useState('')
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', role: 'required' as 'required' | 'optional' })

  const addAgendaItem = () => {
    if (!newAgendaItem.title) return

    const item: AgendaItem = {
      id: `agenda_${Date.now()}`,
      title: newAgendaItem.title,
      duration: newAgendaItem.duration,
      presenter: newAgendaItem.presenter || undefined,
      isCompleted: false
    }

    setMeeting({ ...meeting, agenda: [...meeting.agenda, item] })
    setNewAgendaItem({ title: '', duration: 15, presenter: '' })
  }

  const toggleAgendaItem = (id: string) => {
    setMeeting({
      ...meeting,
      agenda: meeting.agenda.map(item =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    })
  }

  const addNote = () => {
    if (!newNote) return

    const note: MeetingNote = {
      id: `note_${Date.now()}`,
      content: newNote,
      createdBy: 'Ahmet Yılmaz',
      createdAt: new Date()
    }

    setMeeting({ ...meeting, notes: [...meeting.notes, note] })
    setNewNote('')
  }

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.email) return

    const participant: Participant = {
      id: `participant_${Date.now()}`,
      name: newParticipant.name,
      email: newParticipant.email,
      status: 'pending',
      role: newParticipant.role
    }

    setMeeting({ ...meeting, participants: [...meeting.participants, participant] })
    setNewParticipant({ name: '', email: '', role: 'required' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Kabul Etti</Badge>
      case 'declined':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Reddetti</Badge>
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader>
          <CardTitle>{meeting.title}</CardTitle>
          <div className="text-sm text-gray-600">
            {meeting.startTime.toLocaleString('tr-TR')} - {meeting.endTime.toLocaleString('tr-TR')}
          </div>
        </CardHeader>
        <CardContent>
          {meeting.description && (
            <p className="text-gray-700 mb-4">{meeting.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {meeting.room && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <p className="font-medium">{meeting.room.name}</p>
                  <p className="text-sm text-gray-600">Kapasite: {meeting.room.capacity} kişi</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {meeting.room.equipment.map((eq, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{eq}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {meeting.videoLink && (
              <div className="flex items-start gap-2">
                <Video className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Video Konferans</p>
                  <a href={meeting.videoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Toplantıya Katıl
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Katılımcılar ({meeting.participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {meeting.participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{participant.role === 'organizer' ? 'Düzenleyen' : participant.role === 'required' ? 'Gerekli' : 'İsteğe Bağlı'}</Badge>
                  {getStatusBadge(participant.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Add Participant */}
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
            <Label>Katılımcı Ekle</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Input
                placeholder="İsim"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
              />
              <Input
                placeholder="E-posta"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
              />
              <Button onClick={addParticipant}>
                <Plus className="w-4 h-4 mr-2" />
                Ekle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gündem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meeting.agenda.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 border rounded ${
                  item.isCompleted ? 'bg-green-50 dark:bg-green-950' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleAgendaItem(item.id)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className={item.isCompleted ? 'line-through text-gray-500' : 'font-medium'}>
                      {index + 1}. {item.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.duration} dakika
                      {item.presenter && ` • Sunucu: ${item.presenter}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Agenda Item */}
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
            <Label>Gündem Maddesi Ekle</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <Input
                placeholder="Başlık"
                value={newAgendaItem.title}
                onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                className="col-span-2"
              />
              <Input
                type="number"
                placeholder="Süre (dk)"
                value={newAgendaItem.duration}
                onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration: parseInt(e.target.value) })}
              />
              <Button onClick={addAgendaItem}>
                <Plus className="w-4 h-4 mr-2" />
                Ekle
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Clock className="w-4 h-4 inline mr-1" />
              Toplam Süre: {meeting.agenda.reduce((sum, item) => sum + item.duration, 0)} dakika
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Toplantı Notları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {meeting.notes.map(note => (
              <div key={note.id} className="p-3 border rounded">
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {note.createdBy} • {note.createdAt.toLocaleString('tr-TR')}
                </div>
              </div>
            ))}
          </div>

          {/* Add Note */}
          <div className="mt-4">
            <Label>Yeni Not</Label>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Toplantı notunuzu buraya yazın..."
              rows={4}
              className="mt-2"
            />
            <Button onClick={addNote} className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Not Ekle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



