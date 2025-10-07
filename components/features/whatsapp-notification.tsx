'use client';

import { useState } from 'react';
import { MessageSquare, Send, Check, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WhatsAppNotificationProps {
  reportData?: any;
  defaultMessage?: string;
}

export function WhatsAppNotification({ reportData, defaultMessage }: WhatsAppNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(defaultMessage || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      setError('Telefon numarası ve mesaj gerekli');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message,
          reportData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setPhoneNumber('');
          setMessage('');
        }, 2000);
      } else {
        setError(data.error || 'Gönderim başarısız');
      }
    } catch (err: any) {
      setError('Bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-green-500 hover:bg-green-600 text-white border-green-600"
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp'a Gönder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            WhatsApp ile Gönder
          </DialogTitle>
          <DialogDescription>
            Rapor veya bildirimi WhatsApp ile gönderin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in duration-300">
              <div className="bg-green-500 rounded-full p-2">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900">Gönderildi!</p>
                <p className="text-sm text-green-700">WhatsApp mesajı başarıyla gönderildi</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon Numarası
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="5XX XXX XX XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">Başında 0 olmadan giriniz (örn: 532 123 45 67)</p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Mesaj</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Mesajınızı yazın..."
            />
          </div>

          {/* Preview */}
          {reportData && (
            <Card className="bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">📎 Ekli Rapor Bilgisi:</p>
              <p className="text-xs text-gray-600">{reportData.name || 'Rapor'}</p>
            </Card>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSend}
            disabled={loading || !phoneNumber || !message}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Gönder
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

