'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, Calendar, Clock, Users, MapPin, CheckCircle } from 'lucide-react'

interface AISchedulerProps {
  onEventCreate?: (event: any) => void
}

interface Suggestion {
  date: Date
  time: string
  duration: number
  reason: string
  conflicts: number
}

export function AIScheduler({ onEventCreate }: AISchedulerProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedEvent, setParsedEvent] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const parseNaturalLanguage = async () => {
    setIsProcessing(true)

    // Simulate AI parsing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Parse examples:
    // "Yarın saat 3'te Ahmet ile toplantı"
    // "Gelecek Pazartesi 10:00'da satış raporu değerlendirmesi"
    // "15 Ekim'de tüm gün proje kickoff"

    const lowerInput = input.toLowerCase()

    // Basit parsing logic
    let date = new Date()
    let time = '14:00'
    let title = input

    // Tarih parsing
    if (lowerInput.includes('yarın')) {
      date.setDate(date.getDate() + 1)
      title = input.replace(/yarın/gi, '').trim()
    } else if (lowerInput.includes('bugün')) {
      title = input.replace(/bugün/gi, '').trim()
    } else if (lowerInput.includes('pazartesi')) {
      const today = date.getDay()
      const daysUntilMonday = (1 - today + 7) % 7 || 7
      date.setDate(date.getDate() + daysUntilMonday)
    }

    // Saat parsing
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?/)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2] || '00'
      time = `${hours}:${minutes}`
      title = input.replace(/saat\s*\d{1,2}:?\d{0,2}/, '').replace(/\d{1,2}:?\d{0,2}/, '').trim()
    }

    setParsedEvent({
      title: title || 'Yeni Etkinlik',
      date: date,
      time: time,
      duration: 60,
      allDay: lowerInput.includes('tüm gün') || lowerInput.includes('tam gün')
    })

    // AI suggestions
    setSuggestions([
      {
        date: date,
        time: time,
        duration: 60,
        reason: 'Takvimde bu saatte yer var',
        conflicts: 0
      },
      {
        date: new Date(date.getTime() + 3600000),
        time: `${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`,
        duration: 60,
        reason: 'Öğle arası sonrası daha verimli',
        conflicts: 0
      },
      {
        date: new Date(date.getTime() + 86400000),
        time: time,
        duration: 60,
        reason: 'Ertesi gün aynı saatte',
        conflicts: 0
      }
    ])

    setIsProcessing(false)
  }

  const handleCreateEvent = (suggestion?: Suggestion) => {
    const eventData = suggestion
      ? {
          ...parsedEvent,
          date: suggestion.date,
          time: suggestion.time,
          duration: suggestion.duration
        }
      : parsedEvent

    console.log('Creating event:', eventData)
    if (onEventCreate) {
      onEventCreate(eventData)
    }
    
    setInput('')
    setParsedEvent(null)
    setSuggestions([])
  }

  const exampleQueries = [
    'Yarın saat 14:00\'da satış toplantısı',
    'Gelecek Pazartesi 09:00\'da haftalık rapor',
    '15 Ekim tüm gün proje kickoff',
    'Bu Cuma öğleden sonra müşteri ziyareti',
    'Her Pazartesi 10:00\'da standup meeting'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Zamanlama Asistanı
        </CardTitle>
        <p className="text-sm text-gray-600">
          Doğal dille etkinlik oluşturun: "Yarın saat 3'te toplantı", "Gelecek hafta Pazartesi rapor değerlendirmesi"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && parseNaturalLanguage()}
            placeholder="Örn: Yarın saat 14:00'da satış toplantısı"
            className="flex-1"
          />
          <Button onClick={parseNaturalLanguage} disabled={!input || isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Example queries */}
        {!parsedEvent && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Örnek sorgular:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(query)}
                  className="text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>AI analiz ediyor...</span>
            </div>
          </div>
        )}

        {/* Parsed event */}
        {parsedEvent && !isProcessing && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Etkinlik Algılandı
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Başlık:</span>
                  <span>{parsedEvent.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{parsedEvent.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{parsedEvent.time} ({parsedEvent.duration} dakika)</span>
                </div>
                {parsedEvent.allDay && (
                  <Badge>Tüm Gün</Badge>
                )}
              </div>
            </div>

            {/* AI Suggestions */}
            <div>
              <h4 className="font-semibold mb-3">AI Önerileri</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => handleCreateEvent(suggestion)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{suggestion.date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' })}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{suggestion.time}</span>
                          <span className="text-gray-600">({suggestion.duration} dk)</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">💡 {suggestion.reason}</p>
                      </div>
                      {suggestion.conflicts === 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Çakışma Yok
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create button */}
            <div className="flex gap-2">
              <Button onClick={() => handleCreateEvent()} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Etkinlik Oluştur
              </Button>
              <Button variant="outline" onClick={() => { setParsedEvent(null); setInput('') }}>
                İptal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



