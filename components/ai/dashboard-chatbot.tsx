'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, TrendingUp, FileSpreadsheet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

const quickActions = [
  {
    label: 'Bugünkü satışlar',
    icon: TrendingUp,
    query: 'Bugünkü satışlar nasıl?'
  },
  {
    label: 'Excel rapor',
    icon: FileSpreadsheet,
    query: 'Excel olarak rapor oluştur'
  },
  {
    label: 'Bu hafta özet',
    icon: Calendar,
    query: 'Bu hafta nasıl gitti?'
  }
];

export function DashboardChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Merhaba! 👋 Size nasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update welcome message when user is loaded
  useEffect(() => {
    if (user && messages.length === 1) {
      const firmaName = user?.role === 'ADMIN' ? 'RMK' : (user?.company?.name || 'RMK');
      const welcomeMessage = `Merhaba! 👋 Size nasıl yardımcı olabilirim?\n\n${firmaName} firması için dashboard verileriniz, raporlar veya analizler hakkında soru sorabilirsiniz.`;
      
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
      
      console.log('🤖 AI Chatbot - Welcome message updated for company:', firmaName);
    }
  }, [user]);

  // Dashboard verilerini çek
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Kullanıcının firmasına göre veri çek
        let firma = 'RMK'; // Varsayılan
        
        if (user?.role === 'ADMIN') {
          firma = 'RMK';
        } else if (user?.company?.name) {
          firma = user.company.name;
        }

        console.log('🤖 AI Chatbot - Fetching data for company:', firma);

        const response = await fetch('/api/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            firma: firma
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDashboardData(result.data);
            console.log('🤖 AI Chatbot - Dashboard data loaded:', result.data);
          }
        }
      } catch (error) {
        console.error('🤖 AI Chatbot - Error loading dashboard data:', error);
      }
    };

    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen, user]);

  const processQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Simulate AI processing
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);

    let response = '';
    let actions: any[] = [];

    // Firma bilgisi
    const firmaName = user?.role === 'ADMIN' ? 'RMK' : (user?.company?.name || 'RMK');
    const kpiData = dashboardData?.kpiData;
    const topCustomers = dashboardData?.topCustomers || [];
    const companyPerformance = dashboardData?.companyPerformance || [];

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    // Bugünkü satışlar
    if (lowerQuery.includes('bugün') || lowerQuery.includes('today')) {
      if (kpiData && dashboardData) {
        const topCustomer = topCustomers[0];
        response = `📊 ${firmaName} - Bugünkü satışlar: ${formatCurrency(kpiData.toplamCiro)}\n\n` +
                   `• Nakit: ${formatCurrency(kpiData.nakit)}\n` +
                   `• Kredi Kartı: ${formatCurrency(kpiData.krediKarti)}\n` +
                   `• Açık Hesap: ${formatCurrency(kpiData.acikHesap)}\n`;
        
        if (topCustomer) {
          response += `\n• En çok alan: ${topCustomer.name} (${formatCurrency(topCustomer.amount)})\n`;
        }
        
        response += '\nDetaylı rapor ister misiniz?';
      } else {
        response = `⏳ ${firmaName} için veriler yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
      
      actions = [
        {
          label: 'Detaylı Rapor',
          action: () => window.location.href = '/reports/run'
        },
        {
          label: 'Excel İndir',
          action: () => alert('Excel indirme başlatılıyor...')
        }
      ];
    }
    // Haftalık özet
    else if (lowerQuery.includes('hafta') || lowerQuery.includes('week')) {
      response = '📅 Bu hafta özeti:\n\n' +
                 '• Toplam ciro: 1.2M₺\n' +
                 '• Ortalama günlük: 171K₺\n' +
                 '• Geçen haftaya göre %8 artış 🎉\n' +
                 '• En iyi gün: Cuma (245K₺)\n' +
                 '• Toplam müşteri: 1.234\n\n' +
                 'Güzel bir hafta geçirdiniz! 🌟';
    }
    // Aylık karşılaştırma
    else if (lowerQuery.includes('ay') || lowerQuery.includes('month')) {
      response = '📈 Aylık karşılaştırma:\n\n' +
                 '• Bu ay (Ekim): 4.2M₺\n' +
                 '• Geçen ay (Eylül): 3.8M₺\n' +
                 '• Fark: +400K₺ (%10.5 artış)\n\n' +
                 'Hedefin %85\'ine ulaştınız. Son 10 gün için hızlanın! 💪';
      actions = [
        {
          label: 'Grafik Göster',
          action: () => window.location.href = '/?chart=monthly'
        }
      ];
    }
    // Excel export
    else if (lowerQuery.includes('excel') || lowerQuery.includes('rapor')) {
      response = '📄 Excel raporu hazırlanıyor...\n\n' +
                 'Hangi dönem için rapor istersiniz?\n' +
                 '• Bugün\n' +
                 '• Bu hafta\n' +
                 '• Bu ay\n' +
                 '• Özel tarih aralığı';
      actions = [
        {
          label: 'Bugün',
          action: () => alert('Bugünkü Excel raporu indiriliyor...')
        },
        {
          label: 'Bu Hafta',
          action: () => alert('Haftalık Excel raporu indiriliyor...')
        },
        {
          label: 'Bu Ay',
          action: () => alert('Aylık Excel raporu indiriliyor...')
        }
      ];
    }
    // Top müşteriler
    else if (lowerQuery.includes('müşteri') || lowerQuery.includes('customer')) {
      if (topCustomers && topCustomers.length > 0) {
        response = `👥 ${firmaName} - En İyi Müşteriler (Top 5):\n\n`;
        
        topCustomers.slice(0, 5).forEach((customer: any, index: number) => {
          response += `${index + 1}. ${customer.name} - ${formatCurrency(customer.amount)}\n`;
        });
        
        response += '\nDetaylı müşteri analizi için rapor çalıştırabilirsiniz.';
        
        actions = [
          {
            label: 'Tüm Müşteriler',
            action: () => window.location.href = '/reports/run'
          }
        ];
      } else {
        response = `⏳ ${firmaName} için müşteri verileri yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
    }
    // Firma performansı
    else if (lowerQuery.includes('performans') || lowerQuery.includes('firma') || lowerQuery.includes('company')) {
      if (companyPerformance && companyPerformance.length > 0) {
        response = `📈 ${firmaName} - Firma Performansı:\n\n`;
        
        companyPerformance.forEach((company: any) => {
          response += `• ${company.company}: ${formatCurrency(company.revenue)}\n`;
          response += `  Müşteri sayısı: ${company.customers}\n`;
          if (company.marketShare) {
            response += `  Pazar payı: %${company.marketShare.toFixed(1)}\n`;
          }
          response += '\n';
        });
      } else {
        response = `⏳ ${firmaName} için performans verileri yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
    }
    // Yardım
    else if (lowerQuery.includes('yardım') || lowerQuery.includes('help')) {
      response = '❓ Size yardımcı olabileceğim konular:\n\n' +
                 '• 📊 Satış ve ciro bilgileri\n' +
                 '• 📈 Performans analizi\n' +
                 '• 📄 Excel rapor oluşturma\n' +
                 '• 🏆 Ürün ve müşteri analizleri\n' +
                 '• 📅 Dönemsel karşılaştırmalar\n' +
                 '• 🎯 Hedef takibi\n\n' +
                 'Örnek: "Bugünkü satışlar nasıl?" veya "Excel rapor oluştur"';
    }
    // Default response
    else {
      response = '🤔 Bu konuda size yardımcı olmak isterim!\n\n' +
                 'Şu anda şunları yapabilirim:\n' +
                 '• Satış ve ciro sorgulama\n' +
                 '• Rapor oluşturma\n' +
                 '• Karşılaştırma ve analiz\n\n' +
                 'Lütfen daha spesifik bir soru sorun veya "yardım" yazın.';
    }

    return { response, actions };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const { response, actions } = await processQuery(input);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      actions
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-24 rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        title="AI Asistan"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-24 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">AI Dashboard Asistanı</h3>
              <p className="text-xs opacity-90">Size nasıl yardımcı olabilirim?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-muted-foreground mb-2">Hızlı Sorular:</p>
          <div className="flex gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={action.action}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground px-1">
                  {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı yazın..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

