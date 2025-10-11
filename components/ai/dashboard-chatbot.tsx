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
  const [reports, setReports] = useState<any[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0); // Cache için
  const [lastFetchParams, setLastFetchParams] = useState<string>(''); // Parametreleri kontrol et
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

  // Dashboard verilerini ve raporları çek
  useEffect(() => {
    const fetchData = async () => {
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

        // Dashboard verilerini çek
        const dashboardResponse = await fetch('/api/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: new Date().toISOString().split('T')[0], // Bugün
            endDate: new Date().toISOString().split('T')[0], // Bugün
            firma: firma
          }),
        });

        if (dashboardResponse.ok) {
          const result = await dashboardResponse.json();
          if (result.success) {
            setDashboardData(result.data);
            console.log('🤖 AI Chatbot - Dashboard data loaded');
          }
        }

        // Raporları çek
        const reportsResponse = await fetch(`/api/report-configs?companyId=${user.companyId}&userId=${user.id}&userRole=${user.role}`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData);
          console.log('🤖 AI Chatbot - Reports loaded:', reportsData.length);
        }
      } catch (error) {
        console.error('🤖 AI Chatbot - Error loading data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, user]);

  const processQuery = async (query: string) => {
    setIsTyping(true);
    
    // freshData'yı en başta tanımla (scope için)
    let freshData = dashboardData;

    try {
      // Firma belirleme (RMK veya BELPAS)
      let firma = 'RMK'; // Varsayılan
      if (user?.role === 'ADMIN') {
        firma = 'RMK';
      } else if (user?.company?.name) {
        firma = user.company.name.toUpperCase();
      }

      // Tarih aralığı belirleme (bugün, haftalık, vb.)
      let startDate = new Date().toISOString().split('T')[0]; // Bugün
      let endDate = new Date().toISOString().split('T')[0]; // Bugün

      const lowerQuery = query.toLowerCase();
      
      // "bugün" veya "today" denmişse
      if (lowerQuery.includes('bugün') || lowerQuery.includes('today')) {
        startDate = new Date().toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        console.log('🤖 AI - Bugün verisi istendi:', { startDate, endDate, firma });
      }
      // "hafta" veya "week" denmişse
      else if (lowerQuery.includes('hafta') || lowerQuery.includes('week')) {
        startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        console.log('🤖 AI - Haftalık veri istendi:', { startDate, endDate, firma });
      }
      // "ay" veya "month" denmişse (30 gün öncesinden bugüne)
      else if (lowerQuery.includes('ay') || lowerQuery.includes('month') || lowerQuery.includes('aylık')) {
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]; // 30 gün önce
        endDate = new Date().toISOString().split('T')[0]; // Bugün
        console.log('🤖 AI - Aylık veri istendi:', { startDate, endDate, firma });
      }

      // Firma bazlı veri yenileme - CACHE KONTROLÜ
      if (lowerQuery.includes('satış') || lowerQuery.includes('ciro') || lowerQuery.includes('rapor') || 
          lowerQuery.includes('bugün') || lowerQuery.includes('hafta') || lowerQuery.includes('ay')) {
        
        // Cache key oluştur
        const cacheKey = `${firma}-${startDate}-${endDate}`;
        const now = Date.now();
        const cacheAge = now - lastFetchTime;
        
        // Cache kontrolü: Aynı parametrelerle 60 saniye içinde çekilmişse, tekrar çekme
        const shouldFetch = lastFetchParams !== cacheKey || cacheAge > 60000 || !dashboardData;
        
        if (shouldFetch) {
          console.log(`🤖 AI - ${firma} için YENİ veri çekiliyor:`, { startDate, endDate, cacheAge });
          
          try {
            // 90 saniye timeout (gerçek veri için)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000);
            
            const dashboardResponse = await fetch('/api/dashboard', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                startDate,
                endDate,
                firma
              }),
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);

            if (dashboardResponse.ok) {
              const result = await dashboardResponse.json();
              if (result.success && result.data) {
                freshData = result.data;
                setDashboardData(result.data);
                setLastFetchTime(now);
                setLastFetchParams(cacheKey);
                console.log(`✅ ${firma} dashboard verisi güncellendi (${Date.now() - now}ms):`, {
                  toplamCiro: freshData?.kpiData?.toplamCiro
                });
              }
            } else {
              console.error('🤖 AI - Dashboard API hatası:', dashboardResponse.status);
            }
          } catch (error: any) {
            console.error('🤖 AI - Dashboard veri çekme hatası:', error.message);
          
          // Timeout veya hata durumunda özel mesaj
          setIsTyping(false);
          
          const isTimeout = error.name === 'AbortError' || error.message.includes('aborted');
          
          if (isTimeout) {
            return `⏰ ${firma} firması için veri yüklenirken zaman aşımı oluştu.\n\n` +
                   `API sunucusu 90 saniye içinde yanıt vermedi.\n\n` +
                   `💡 Öneriler:\n` +
                   `• Birkaç dakika sonra tekrar deneyin\n` +
                   `• Dashboard sayfasını kontrol edin\n` +
                   `• Daha kısa tarih aralığı seçin`;
          }
          
          return `⚠️ ${firma} için güncel veriler yüklenirken bir hata oluştu.\n\n` +
                 `Hata: ${error.message}\n\n` +
                 `Lütfen daha sonra tekrar deneyin veya dashboard sayfasını kontrol edin.`;
          }
        } else {
          // Cache kullan - Hızlı yanıt!
          console.log(`⚡ ${firma} için CACHE kullanılıyor (${cacheAge}ms önce çekildi)`);
          freshData = dashboardData;
        }
      }

      // AI API'ye istek gönder - GÜNCEL VERİYİ KULLAN
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          dashboardData: freshData, // YENİ VERİYİ GÖNDER
          reports,
          userContext: {
            firma,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Kullanıcı',
            role: user?.role,
            startDate,
            endDate
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsTyping(false);
        return result.message;
      }
    } catch (error) {
      console.error('🤖 AI error:', error);
    }

    setIsTyping(false);

    // Fallback response - GÜNCEL VERİYİ KULLAN
    const lowerQuery = query.toLowerCase();
    let responseText = '';
    let actions: any[] = [];

    // Firma bilgisi ve GÜNCEL VERİ
    const firmaName = user?.role === 'ADMIN' ? 'RMK' : (user?.company?.name || 'RMK');
    
    // freshData'yı kullan (eğer yeni çekildiyse, yoksa dashboardData'yı kullan)
    const currentData = freshData || dashboardData;
    const kpiData = currentData?.kpiData;
    const topCustomers = currentData?.topCustomers || [];
    const companyPerformance = currentData?.companyPerformance || [];
    
    console.log('🤖 AI Fallback - Query:', lowerQuery);
    console.log('🤖 AI Fallback - currentData:', currentData ? 'VAR' : 'YOK');
    console.log('🤖 AI Fallback - kpiData:', kpiData);

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
    if (lowerQuery.includes('bugün') || lowerQuery.includes('today') || lowerQuery.includes('satış')) {
      if (kpiData && currentData) {
        const topCustomer = topCustomers[0];
        const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
        
        console.log('🤖 AI Fallback - KPI Data:', kpiData);
        
        responseText = `📊 ${firmaName} - Satışlar: ${formatCurrency(kpiData.toplamCiro)}\n` +
                   `📅 Tarih: ${today}\n\n` +
                   `• Nakit: ${formatCurrency(kpiData.nakit)}\n` +
                   `• Kredi Kartı: ${formatCurrency(kpiData.krediKarti)}\n` +
                   `• Açık Hesap: ${formatCurrency(kpiData.acikHesap)}\n`;
        
        if (topCustomer) {
          responseText += `\n• En çok alan: ${topCustomer.name} (${formatCurrency(topCustomer.amount)})\n`;
        }
        
        responseText += `\nℹ️ ${firmaName} firması için Satış Raporu ${firmaName} API kullanıldı.\n\nDetaylı rapor ister misiniz?`;
      } else {
        console.log('🤖 AI Fallback - No KPI Data available');
        responseText = `⏰ ${firmaName} için veriler yüklenemedi.\n\n` +
                   `API sunucusu yanıt vermedi (90 saniye timeout).\n\n` +
                   `💡 Öneriler:\n` +
                   `• Birkaç dakika bekleyin ve tekrar deneyin\n` +
                   `• Dashboard sayfasını kontrol edin\n` +
                   `• Sistem yöneticisiyle iletişime geçin`;
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
      if (kpiData && dashboardData) {
        const weekStart = new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' });
        const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
        responseText = `📅 ${firmaName} - Bu hafta özeti:\n` +
                   `📅 Tarih: ${weekStart} - ${today}\n\n` +
                   `• Toplam ciro: ${formatCurrency(kpiData.toplamCiro)}\n` +
                   `• Nakit: ${formatCurrency(kpiData.nakit)}\n` +
                   `• Kredi Kartı: ${formatCurrency(kpiData.krediKarti)}\n` +
                   `• Açık Hesap: ${formatCurrency(kpiData.acikHesap)}\n\n` +
                   `ℹ️ ${firmaName} firması için Satış Raporu ${firmaName} API kullanıldı.\n\n` +
                   'Güzel bir hafta geçirdiniz! 🌟';
      } else {
        responseText = `⏳ ${firmaName} için haftalık veriler yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
    }
    // Aylık karşılaştırma
    else if (lowerQuery.includes('ay') || lowerQuery.includes('month')) {
      responseText = '📈 Aylık karşılaştırma:\n\n' +
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
      responseText = '📄 Excel raporu hazırlanıyor...\n\n' +
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
        responseText = `👥 ${firmaName} - En İyi Müşteriler (Top 5):\n\n`;
        
        topCustomers.slice(0, 5).forEach((customer: any, index: number) => {
          responseText += `${index + 1}. ${customer.name} - ${formatCurrency(customer.amount)}\n`;
        });
        
        responseText += '\nDetaylı müşteri analizi için rapor çalıştırabilirsiniz.';
        
        actions = [
          {
            label: 'Tüm Müşteriler',
            action: () => window.location.href = '/reports/run'
          }
        ];
      } else {
        responseText = `⏳ ${firmaName} için müşteri verileri yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
    }
    // Firma performansı
    else if (lowerQuery.includes('performans') || lowerQuery.includes('firma') || lowerQuery.includes('company')) {
      if (companyPerformance && companyPerformance.length > 0) {
        responseText = `📈 ${firmaName} - Firma Performansı:\n\n`;
        
        companyPerformance.forEach((company: any) => {
          responseText += `• ${company.company}: ${formatCurrency(company.revenue)}\n`;
          responseText += `  Müşteri sayısı: ${company.customers}\n`;
          if (company.marketShare) {
            responseText += `  Pazar payı: %${company.marketShare.toFixed(1)}\n`;
          }
          responseText += '\n';
        });
      } else {
        responseText = `⏳ ${firmaName} için performans verileri yükleniyor...\n\nLütfen birkaç saniye bekleyin ve tekrar deneyin.`;
      }
    }
    // Nakit satışlar
    else if (lowerQuery.includes('nakit')) {
      if (kpiData) {
        const nakitOran = ((kpiData.nakit / kpiData.toplamCiro) * 100).toFixed(1);
        responseText = `💵 ${firmaName} - Nakit Satışlar:\n\n` +
                   `• Toplam nakit: ${formatCurrency(kpiData.nakit)}\n` +
                   `• Toplam ciro içindeki payı: %${nakitOran}\n\n`;
        
        if (parseFloat(nakitOran) > 50) {
          responseText += '✅ Nakit satışlarınız güçlü! 💪';
        } else {
          responseText += '📊 Nakit satışlarınız dengelenmiş durumda.';
        }
      } else {
        responseText = `⏳ ${firmaName} için veriler yükleniyor...`;
      }
    }
    // Kredi kartı satışlar
    else if (lowerQuery.includes('kredi') || lowerQuery.includes('kart')) {
      if (kpiData) {
        const kartOran = ((kpiData.krediKarti / kpiData.toplamCiro) * 100).toFixed(1);
        responseText = `💳 ${firmaName} - Kredi Kartı Satışlar:\n\n` +
                   `• Toplam kredi kartı: ${formatCurrency(kpiData.krediKarti)}\n` +
                   `• Toplam ciro içindeki payı: %${kartOran}\n\n` +
                   '💡 Kredi kartı ile satışlarınız güvenli ve takip edilebilir.';
      } else {
        responseText = `⏳ ${firmaName} için veriler yükleniyor...`;
      }
    }
    // Açık hesap
    else if (lowerQuery.includes('açık') || lowerQuery.includes('acik') || lowerQuery.includes('hesap')) {
      if (kpiData) {
        const acikHesapOran = ((kpiData.acikHesap / kpiData.toplamCiro) * 100).toFixed(1);
        responseText = `📋 ${firmaName} - Açık Hesap Satışlar:\n\n` +
                   `• Toplam açık hesap: ${formatCurrency(kpiData.acikHesap)}\n` +
                   `• Toplam ciro içindeki payı: %${acikHesapOran}\n\n`;
        
        if (parseFloat(acikHesapOran) > 30) {
          responseText += '⚠️ Açık hesap oranı yüksek. Tahsilatlara dikkat edin!';
        } else {
          responseText += '✅ Açık hesap oranınız dengeli.';
        }
      } else {
        responseText = `⏳ ${firmaName} için veriler yükleniyor...`;
      }
    }
    // Toplam ciro
    else if (lowerQuery.includes('ciro') || lowerQuery.includes('toplam')) {
      if (kpiData) {
        responseText = `💰 ${firmaName} - Toplam Ciro:\n\n` +
                   `• Genel Toplam: ${formatCurrency(kpiData.toplamCiro)}\n\n` +
                   `Detay:\n` +
                   `• Nakit: ${formatCurrency(kpiData.nakit)} (%${((kpiData.nakit / kpiData.toplamCiro) * 100).toFixed(1)})\n` +
                   `• Kredi Kartı: ${formatCurrency(kpiData.krediKarti)} (%${((kpiData.krediKarti / kpiData.toplamCiro) * 100).toFixed(1)})\n` +
                   `• Açık Hesap: ${formatCurrency(kpiData.acikHesap)} (%${((kpiData.acikHesap / kpiData.toplamCiro) * 100).toFixed(1)})\n\n` +
                   `ℹ️ ${firmaName} firması için Satış Raporu ${firmaName} API kullanıldı.\n\n` +
                   '🎉 Harika bir performans!';
      } else {
        responseText = `⏳ ${firmaName} için veriler yükleniyor...`;
      }
    }
    // En iyi müşteri
    else if (lowerQuery.includes('en iyi') || lowerQuery.includes('en çok') || lowerQuery.includes('top')) {
      if (topCustomers && topCustomers.length > 0) {
        const topCustomer = topCustomers[0];
        responseText = `🏆 ${firmaName} - En İyi Müşteri:\n\n` +
                   `👑 ${topCustomer.name}\n` +
                   `💰 Toplam: ${formatCurrency(topCustomer.amount)}\n\n` +
                   `Diğer top 3:\n`;
        
        topCustomers.slice(1, 3).forEach((customer: any, index: number) => {
          responseText += `${index + 2}. ${customer.name} - ${formatCurrency(customer.amount)}\n`;
        });
        
        responseText += '\n✨ Bu müşterilerinizi koruyun!';
      } else {
        responseText = `⏳ ${firmaName} için müşteri verileri yükleniyor...`;
      }
    }
    // Grafik göster
    else if (lowerQuery.includes('grafik') || lowerQuery.includes('chart')) {
      responseText = '📊 Hangi grafikleri görmek istersiniz?\n\n' +
                 '• Günlük satışlar\n' +
                 '• Ödeme dağılımı\n' +
                 '• Aylık karşılaştırma\n' +
                 '• Firma performansı\n\n' +
                 'Dashboard sayfasında tüm grafikleri görebilirsiniz!';
      actions = [
        {
          label: 'Dashboard\'a Git',
          action: () => window.location.href = '/'
        }
      ];
    }
    // Tarih sorgulama
    else if (lowerQuery.includes('dün') || lowerQuery.includes('yesterday')) {
      responseText = `📅 ${firmaName} - Dünün verileri:\n\n` +
                 `Tarih filtresini değiştirerek dünün verilerini görebilirsiniz.\n\n` +
                 '💡 Dashboard\'da tarih aralığını seçin!';
      actions = [
        {
          label: 'Dashboard\'a Git',
          action: () => window.location.href = '/'
        }
      ];
    }
    // Karşılaştırma
    else if (lowerQuery.includes('karşılaştır') || lowerQuery.includes('compare')) {
      responseText = '📊 Karşılaştırma Modu:\n\n' +
                 'İki dönemi yan yana karşılaştırabilirsiniz!\n\n' +
                 '• Farklı ayları karşılaştırın\n' +
                 '• Yılları karşılaştırın\n' +
                 '• Grafik ile görselleştirin';
      actions = [
        {
          label: 'Karşılaştırma Sayfası',
          action: () => window.location.href = '/comparison'
        }
      ];
    }
    // Rapor tasarımcı
    else if (lowerQuery.includes('tasarım') || lowerQuery.includes('designer')) {
      responseText = '🎨 Rapor Tasarımcı:\n\n' +
                 'Kendi özel raporlarınızı oluşturun!\n\n' +
                 '• Widget seçin\n' +
                 '• Grafikler ekleyin\n' +
                 '• Kaydedin ve paylaşın';
      actions = [
        {
          label: 'Rapor Tasarımcı',
          action: () => window.location.href = '/report-designer'
        }
      ];
    }
    // Selam, merhaba
    else if (lowerQuery.includes('merhaba') || lowerQuery.includes('selam') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      const saatler = new Date().getHours();
      let selamlama = 'Merhaba';
      if (saatler < 12) selamlama = 'Günaydın';
      else if (saatler < 18) selamlama = 'İyi günler';
      else selamlama = 'İyi akşamlar';
      
      responseText = `${selamlama}! 👋\n\n` +
                 `${firmaName} dashboard asistanınız olarak size yardımcı olmak için buradayım! 🤖\n\n` +
                 'Size nasıl yardımcı olabilirim?';
    }
    // Teşekkür
    else if (lowerQuery.includes('teşekkür') || lowerQuery.includes('tesekkur') || lowerQuery.includes('sağol') || lowerQuery.includes('sagol') || lowerQuery.includes('thanks')) {
      responseText = 'Rica ederim! 😊\n\nBaşka bir konuda yardımcı olabilirsem lütfen çekinmeyin!';
    }
    // Nasılsın
    else if (lowerQuery.includes('nasıl') || lowerQuery.includes('how are you')) {
      responseText = `Ben harikayım, teşekkürler! 🤖✨\n\n${firmaName} için verilerinizi analiz etmeye hazırım. Size nasıl yardımcı olabilirim?`;
    }
    // Kim
    else if (lowerQuery.includes('kimsin') || lowerQuery.includes('kim') || lowerQuery.includes('who are you')) {
      responseText = `Ben ${firmaName} Dashboard AI Asistanınızım! 🤖\n\n` +
                 'Size şunlarda yardımcı olabilirim:\n' +
                 '• 📊 Satış ve ciro analizi\n' +
                 '• 👥 Müşteri raporları\n' +
                 '• 📈 Performans takibi\n' +
                 '• 📄 Excel raporları\n' +
                 '• 🎯 İş analizleri\n\n' +
                 'Soru sormaktan çekinmeyin!';
    }
    // Yardım
    else if (lowerQuery.includes('yardım') || lowerQuery.includes('help') || lowerQuery.includes('ne yapabilirsin')) {
      responseText = '❓ Size yardımcı olabileceğim konular:\n\n' +
                 '📊 **Satış Bilgileri:**\n' +
                 '• "Bugünkü satışlar nasıl?"\n' +
                 '• "Toplam ciro ne kadar?"\n' +
                 '• "Nakit satışlar ne kadar?"\n\n' +
                 '👥 **Müşteri Analizi:**\n' +
                 '• "En iyi müşteriler kimler?"\n' +
                 '• "Müşteri listesi"\n\n' +
                 '📈 **Performans:**\n' +
                 '• "Firma performansı nasıl?"\n' +
                 '• "Bu hafta nasıl gitti?"\n\n' +
                 '📄 **Raporlar:**\n' +
                 '• "Excel rapor oluştur"\n' +
                 '• "Rapor çalıştır"\n\n' +
                 '💬 Sohbet edebilir, soru sorabilirsiniz!';
    }
    // Default response - Daha akıllı
    else {
      // Soru mu soruyor?
      const isSoru = lowerQuery.includes('?') || 
                     lowerQuery.includes('nasıl') || 
                     lowerQuery.includes('ne') || 
                     lowerQuery.includes('kim') || 
                     lowerQuery.includes('nerede') || 
                     lowerQuery.includes('kaç') || 
                     lowerQuery.includes('hangi');
      
      if (isSoru) {
        responseText = `🤔 "${query}" hakkında size yardımcı olmak isterim!\n\n` +
                   `Şu konularda size daha iyi yardımcı olabilirim:\n\n` +
                   `• 📊 Satışlar ve ciro\n` +
                   `• 👥 Müşteri analizleri\n` +
                   `• 📈 Firma performansı\n` +
                   `• 📄 Rapor oluşturma\n\n` +
                   `Örnek: "Bugünkü satışlar nasıl?" veya "En iyi müşteriler kimler?"`;
      } else {
        responseText = `💬 "${query}"\n\n` +
                   `Anladım! Size nasıl yardımcı olabilirim?\n\n` +
                   `"yardım" yazarak neler yapabileceğimi öğrenebilirsiniz. 😊`;
      }
    }

    return responseText;
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

    const responseText = await processQuery(input);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date()
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

