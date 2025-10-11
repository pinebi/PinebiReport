'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react'

interface NotificationSettings {
  email: {
    enabled: boolean
    address: string
    timing: string[]
  }
  whatsapp: {
    enabled: boolean
    phone: string
    timing: string[]
  }
  sms: {
    enabled: boolean
    phone: string
    timing: string[]
  }
  push: {
    enabled: boolean
    timing: string[]
  }
  defaultTiming: string
}

const timingOptions = [
  { value: '0', label: 'Etkinlik zamanında' },
  { value: '5', label: '5 dakika önce' },
  { value: '15', label: '15 dakika önce' },
  { value: '30', label: '30 dakika önce' },
  { value: '60', label: '1 saat önce' },
  { value: '120', label: '2 saat önce' },
  { value: '1440', label: '1 gün önce' },
  { value: '2880', label: '2 gün önce' },
  { value: '10080', label: '1 hafta önce' }
]

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      address: '',
      timing: ['60', '1440']
    },
    whatsapp: {
      enabled: false,
      phone: '',
      timing: ['15', '60']
    },
    sms: {
      enabled: false,
      phone: '',
      timing: ['30']
    },
    push: {
      enabled: true,
      timing: ['5', '15']
    },
    defaultTiming: '15'
  })

  const handleSave = async () => {
    console.log('Saving notification settings:', settings)
    // API call to save settings
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        alert('Bildirim ayarları kaydedildi!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            E-posta Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled">E-posta bildirimleri</Label>
            <Switch
              id="email-enabled"
              checked={settings.email.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email: { ...settings.email, enabled: checked } })
              }
            />
          </div>
          {settings.email.enabled && (
            <>
              <div>
                <Label>E-posta Adresi</Label>
                <Input
                  type="email"
                  value={settings.email.address}
                  onChange={(e) =>
                    setSettings({ ...settings, email: { ...settings.email, address: e.target.value } })
                  }
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <Label>Bildirim Zamanları</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {timingOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.email.timing.includes(option.value)}
                        onChange={(e) => {
                          const newTiming = e.target.checked
                            ? [...settings.email.timing, option.value]
                            : settings.email.timing.filter(t => t !== option.value)
                          setSettings({ ...settings, email: { ...settings.email, timing: newTiming } })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            WhatsApp Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp-enabled">WhatsApp bildirimleri</Label>
            <Switch
              id="whatsapp-enabled"
              checked={settings.whatsapp.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, whatsapp: { ...settings.whatsapp, enabled: checked } })
              }
            />
          </div>
          {settings.whatsapp.enabled && (
            <>
              <div>
                <Label>Telefon Numarası</Label>
                <Input
                  type="tel"
                  value={settings.whatsapp.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: { ...settings.whatsapp, phone: e.target.value } })
                  }
                  placeholder="+90 555 123 4567"
                />
              </div>
              <div>
                <Label>Bildirim Zamanları</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {timingOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.whatsapp.timing.includes(option.value)}
                        onChange={(e) => {
                          const newTiming = e.target.checked
                            ? [...settings.whatsapp.timing, option.value]
                            : settings.whatsapp.timing.filter(t => t !== option.value)
                          setSettings({ ...settings, whatsapp: { ...settings.whatsapp, timing: newTiming } })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            SMS Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled">SMS bildirimleri</Label>
            <Switch
              id="sms-enabled"
              checked={settings.sms.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, sms: { ...settings.sms, enabled: checked } })
              }
            />
          </div>
          {settings.sms.enabled && (
            <>
              <div>
                <Label>Telefon Numarası</Label>
                <Input
                  type="tel"
                  value={settings.sms.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, sms: { ...settings.sms, phone: e.target.value } })
                  }
                  placeholder="+90 555 123 4567"
                />
              </div>
              <div>
                <Label>Bildirim Zamanları</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {timingOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.sms.timing.includes(option.value)}
                        onChange={(e) => {
                          const newTiming = e.target.checked
                            ? [...settings.sms.timing, option.value]
                            : settings.sms.timing.filter(t => t !== option.value)
                          setSettings({ ...settings, sms: { ...settings.sms, timing: newTiming } })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Push Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled">Push bildirimleri</Label>
            <Switch
              id="push-enabled"
              checked={settings.push.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, push: { ...settings.push, enabled: checked } })
              }
            />
          </div>
          {settings.push.enabled && (
            <div>
              <Label>Bildirim Zamanları</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {timingOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.push.timing.includes(option.value)}
                      onChange={(e) => {
                        const newTiming = e.target.checked
                          ? [...settings.push.timing, option.value]
                          : settings.push.timing.filter(t => t !== option.value)
                        setSettings({ ...settings, push: { ...settings.push, timing: newTiming } })
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Ayarları Kaydet
      </Button>
    </div>
  )
}



