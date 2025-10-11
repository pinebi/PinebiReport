'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, ArrowLeftRight, BarChart3, TrendingUp, Download, Play, RefreshCw, Star, Save, Clock, Zap, Share2, Lightbulb, AlertTriangle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface PeriodData {
  totalSales: number;
  customerCount: number;
  averageBasket: number;
  totalTransactions: number;
  cash: number;
  creditCard: number;
  openAccount: number;
  bestDay: string;
  bestDayAmount: number;
  topProduct: string;
  firmas: string[];
}

interface ComparisonFavorite {
  id: string;
  name: string;
  description?: string;
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
  selectedFirms?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function ComparisonPage() {
  const { user } = useAuth();
  const [period1, setPeriod1] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [period2, setPeriod2] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [period1Data, setPeriod1Data] = useState<PeriodData | null>(null);
  const [period2Data, setPeriod2Data] = useState<PeriodData | null>(null);
  const [period1RawData, setPeriod1RawData] = useState<any[]>([]); // Ham veri
  const [period2RawData, setPeriod2RawData] = useState<any[]>([]); // Ham veri
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFirms, setAvailableFirms] = useState<string[]>([]);
  const [selectedFirms, setSelectedFirms] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<ComparisonFavorite[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteDescription, setFavoriteDescription] = useState('');
  const [nextPeriodToSet, setNextPeriodToSet] = useState<1 | 2>(1); // Hangi dönemi güncelleyeceğimizi takip eder
  const [selectedMonth1, setSelectedMonth1] = useState<number | null>(null); // 1. dönem için seçili ay
  const [selectedMonth2, setSelectedMonth2] = useState<number | null>(null); // 2. dönem için seçili ay
  const [colorTheme, setColorTheme] = useState<'blue' | 'green' | 'purple' | 'orange'>('blue'); // Tema rengi

  // Firma filtreleme fonksiyonu
  const filterDataByFirms = (data: any[], firms: string[]) => {
    // Hiç firma seçili değilse boş array dön
    if (firms.length === 0) return [];
    // Seçili firmaları filtrele
    return data.filter(item => firms.includes(item.Firma || 'Bilinmeyen'));
  };

  // useEffect'i kaldırdık - doğrudan fonksiyonlarda runComparison çağırıyoruz

  // Tüm firmaları seç/seçme
  const handleToggleAllFirms = () => {
    const newSelection = selectedFirms.length === availableFirms.length ? [] : [...availableFirms];
    console.log('🔄 Tümünü Seç/Kaldır tıklandı:', {
      öncekiSeçim: selectedFirms,
      yeniSeçim: newSelection,
      tümFirmalar: availableFirms
    });
    setSelectedFirms(newSelection);
    
    // Doğrudan yeni seçimi parametre olarak geç
    console.log('🔄 Tümünü Seç/Kaldır - Karşılaştırma güncelleniyor...');
    runComparison(newSelection);
  };

  const runComparison = useCallback(async (firmsToUse?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // Her iki dönem için ortak currentSelectedFirms hesapla
      let currentSelectedFirms = firmsToUse || selectedFirms;
      console.log('🚀 Karşılaştırma başlatıldı:', { 
        period1Start: period1.start,
        period1End: period1.end,
        period2Start: period2.start,
        period2End: period2.end,
        selectedFirms: selectedFirms,
        firmsToUse: firmsToUse,
        currentSelectedFirms: currentSelectedFirms,
        currentSelectedFirmsCount: currentSelectedFirms.length,
        availableFirms: availableFirms,
        tarihlerFarklıMi: period1.start !== period2.start || period1.end !== period2.end
      });

      // Timeout için AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ API Timeout - 90 saniye aşıldı');
        controller.abort();
      }, 90000); // 90 saniye

      try {
        // Her iki dönem için paralel veri çekimi
        const [data1Response, data2Response] = await Promise.all([
          fetch('/api/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              companyId: user?.companyId,
              startDate: period1.start,
              endDate: period1.end,
              firma: user?.company?.name || 'RMK'
            }),
            signal: controller.signal
          }),
          fetch('/api/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              companyId: user?.companyId,
              startDate: period2.start,
              endDate: period2.end,
              firma: user?.company?.name || 'RMK'
            }),
            signal: controller.signal
          })
        ]);

        clearTimeout(timeoutId);

      const data1 = await data1Response.json();
      const data2 = await data2Response.json();

      console.log('📊 1. Dönem FULL RESPONSE:', JSON.stringify(data1, null, 2));
      console.log('📊 2. Dönem FULL RESPONSE:', JSON.stringify(data2, null, 2));

      if (!data1.success) {
        throw new Error('1. Dönem verisi alınamadı: ' + (data1.error || 'Bilinmeyen hata'));
      }

      if (!data2.success) {
        throw new Error('2. Dönem verisi alınamadı: ' + (data2.error || 'Bilinmeyen hata'));
      }

      // İlk çalıştırmada tüm firmaları bul ve seç
      if (availableFirms.length === 0 && data1.success && data1.data) {
        const allGridData1 = Array.isArray(data1.data.dailyGrid) ? data1.data.dailyGrid : [];
        const allFirms = Array.from(new Set(allGridData1.map((item: any) => item.Firma || 'Bilinmeyen'))) as string[];
        // İlk yüklemede otomatik güncelleme yapma
        setAvailableFirms(allFirms);
        setSelectedFirms(allFirms); // Başlangıçta tüm firmaları seç
        currentSelectedFirms = allFirms; // İlk hesaplama için tüm firmaları kullan
        console.log('✅ İlk çalıştırma - Tüm firmalar seçildi:', allFirms);
      }
      
      console.log('🎯 HER İKİ DÖNEM İÇİN currentSelectedFirms:', currentSelectedFirms);
      console.log('🎯 currentSelectedFirms.length:', currentSelectedFirms.length);

      if (data1.success && data1.data) {
        // Dashboard API'den gelen veri yapısını kontrol et
        console.log('📊 1. Dönem data yapısı:', Object.keys(data1.data));
        console.log('📊 1. Dönem kpiData:', data1.data.kpiData);

        const kpiData1 = data1.data.kpiData || {};
        const allGridData1 = Array.isArray(data1.data.dailyGrid) ? data1.data.dailyGrid : [];
        
        // Firma filtresini uygula (ilk çalıştırmada tüm firmalar)
        const gridData1 = filterDataByFirms(allGridData1, currentSelectedFirms);

        console.log('📊 1. Dönem KPI Data:', kpiData1);
        console.log('📊 1. Dönem Grid Data (filtered):', gridData1);
        console.log('📊 1. Dönem Grid Data LENGTH:', gridData1.length);

        // Filtrelenmiş grid verilerinden hesaplamalar yap
        const totalSales = currentSelectedFirms.length > 0 ? gridData1.reduce((sum: number, item: any) => sum + (item['GENEL_TOPLAM'] || 0), 0) : 0;
        const customerCount = currentSelectedFirms.length > 0 ? gridData1.reduce((sum: number, item: any) => sum + (item['Musteri Sayisi'] || 0), 0) : 0;
        const averageBasket = customerCount > 0 ? totalSales / customerCount : 0;
        
        console.log('💰 1. Dönem HESAPLANAN DEĞERLER:', {
          totalSales,
          customerCount,
          averageBasket,
          currentSelectedFirmsLength: currentSelectedFirms.length
        });

        // Grid verilerinden hesaplamalar (filtrelenmiş)
        const cash = currentSelectedFirms.length > 0 ? gridData1.reduce((sum: number, item: any) => sum + (item['NAKIT'] || 0), 0) : 0;
        const creditCard = currentSelectedFirms.length > 0 ? gridData1.reduce((sum: number, item: any) => sum + (item['KREDI_KARTI'] || 0), 0) : 0;
        const openAccount = currentSelectedFirms.length > 0 ? gridData1.reduce((sum: number, item: any) => sum + (item['ACIK_HESAP'] || 0), 0) : 0;
        let bestDay = 'Veri yok';
        let bestDayAmount = 0;
        let topProduct = 'Veri yok';
        let firmas: string[] = [];

        if (gridData1.length > 0 && currentSelectedFirms.length > 0) {
          // En yüksek cirolu günü bul
          const sortedByRevenue = [...gridData1].sort((a: any, b: any) => (b['GENEL_TOPLAM'] || 0) - (a['GENEL_TOPLAM'] || 0));
          if (sortedByRevenue.length > 0 && sortedByRevenue[0]) {
            bestDay = sortedByRevenue[0]['Tarih'] || 'Bilinmiyor';
            bestDayAmount = parseFloat(sortedByRevenue[0]['GENEL_TOPLAM']) || 0;
          }
          
          // Firma listesi ve en çok satan firma
          const firmaTotals = gridData1.reduce((acc: any, item: any) => {
            const firma = item['Firma'] || 'Bilinmeyen';
            acc[firma] = (acc[firma] || 0) + (item['GENEL_TOPLAM'] || 0);
            return acc;
          }, {});
          
          firmas = Object.keys(firmaTotals);
          const topFirma = Object.entries(firmaTotals).sort(([,a]: any, [,b]: any) => b - a)[0];
          topProduct = topFirma ? topFirma[0] as string : 'Bilinmiyor';
        } else if (currentSelectedFirms.length === 0) {
          bestDay = 'Firma seçilmedi';
          bestDayAmount = 0;
          topProduct = 'Firma seçilmedi';
          firmas = [];
        }

        setPeriod1Data({
          totalSales,
          customerCount,
          averageBasket,
          totalTransactions: currentSelectedFirms.length > 0 ? gridData1.length : 0,
          cash,
          creditCard,
          openAccount,
          bestDay,
          bestDayAmount,
          topProduct,
          firmas
        });
        
        // Ham veriyi kaydet (firma bazlı ciro hesaplamaları için)
        setPeriod1RawData(gridData1);
      }

      if (data2.success && data2.data) {
        // Dashboard API'den gelen veri yapısını kontrol et
        console.log('📊 2. Dönem data yapısı:', Object.keys(data2.data));
        console.log('📊 2. Dönem kpiData:', data2.data.kpiData);

        const kpiData2 = data2.data.kpiData || {};
        const allGridData2 = Array.isArray(data2.data.dailyGrid) ? data2.data.dailyGrid : [];
        
        // 1. Dönem ile AYNI currentSelectedFirms'ü kullan (fonksiyonun başında hesaplandı)
        // currentSelectedFirms zaten yukarıda tanımlandı, burada yeniden hesaplama!
        
        // Firma filtresini uygula
        const gridData2 = filterDataByFirms(allGridData2, currentSelectedFirms);

        console.log('📊 2. Dönem KPI Data:', kpiData2);
        console.log('📊 2. Dönem Grid Data (filtered):', gridData2);
        console.log('📊 2. Dönem Seçili Firmalar:', currentSelectedFirms);

        // Filtrelenmiş grid verilerinden hesaplamalar yap
        const totalSales = currentSelectedFirms.length > 0 ? gridData2.reduce((sum: number, item: any) => sum + (item['GENEL_TOPLAM'] || 0), 0) : 0;
        const customerCount = currentSelectedFirms.length > 0 ? gridData2.reduce((sum: number, item: any) => sum + (item['Musteri Sayisi'] || 0), 0) : 0;
        const averageBasket = customerCount > 0 ? totalSales / customerCount : 0;

        // Grid verilerinden hesaplamalar (filtrelenmiş)
        const cash = currentSelectedFirms.length > 0 ? gridData2.reduce((sum: number, item: any) => sum + (item['NAKIT'] || 0), 0) : 0;
        const creditCard = currentSelectedFirms.length > 0 ? gridData2.reduce((sum: number, item: any) => sum + (item['KREDI_KARTI'] || 0), 0) : 0;
        const openAccount = currentSelectedFirms.length > 0 ? gridData2.reduce((sum: number, item: any) => sum + (item['ACIK_HESAP'] || 0), 0) : 0;
        let bestDay = 'Veri yok';
        let bestDayAmount = 0;
        let topProduct = 'Veri yok';
        let firmas: string[] = [];

        if (gridData2.length > 0 && currentSelectedFirms.length > 0) {
          // En yüksek cirolu günü bul
          const sortedByRevenue = [...gridData2].sort((a: any, b: any) => (b['GENEL_TOPLAM'] || 0) - (a['GENEL_TOPLAM'] || 0));
          if (sortedByRevenue.length > 0 && sortedByRevenue[0]) {
            bestDay = sortedByRevenue[0]['Tarih'] || 'Bilinmiyor';
            bestDayAmount = parseFloat(sortedByRevenue[0]['GENEL_TOPLAM']) || 0;
          }
          
          // Firma listesi ve en çok satan firma
          const firmaTotals = gridData2.reduce((acc: any, item: any) => {
            const firma = item['Firma'] || 'Bilinmeyen';
            acc[firma] = (acc[firma] || 0) + (item['GENEL_TOPLAM'] || 0);
            return acc;
          }, {});
          
          firmas = Object.keys(firmaTotals);
          const topFirma = Object.entries(firmaTotals).sort(([,a]: any, [,b]: any) => b - a)[0];
          topProduct = topFirma ? topFirma[0] as string : 'Bilinmiyor';
        } else if (currentSelectedFirms.length === 0) {
          bestDay = 'Firma seçilmedi';
          bestDayAmount = 0;
          topProduct = 'Firma seçilmedi';
          firmas = [];
        }

        setPeriod2Data({
          totalSales,
          customerCount,
          averageBasket,
          totalTransactions: currentSelectedFirms.length > 0 ? gridData2.length : 0,
          cash,
          creditCard,
          openAccount,
          bestDay,
          bestDayAmount,
          topProduct,
          firmas
        });
        
        // Ham veriyi kaydet (firma bazlı ciro hesaplamaları için)
        setPeriod2RawData(gridData2);
      }

      console.log('✅ Karşılaştırma tamamlandı');

      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.error('❌ API Fetch Hatası:', fetchErr);
        if (fetchErr.name === 'AbortError') {
          throw new Error('API zaman aşımı (90 saniye). Lütfen daha kısa tarih aralığı seçin.');
        }
        throw fetchErr;
      }

    } catch (err: any) {
      console.error('❌ Karşılaştırma hatası:', err);
      setError(err.message || 'Veri çekilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedFirms, period1, period2, user?.id, user?.companyId, user?.company?.name, availableFirms]);

  const formatCurrency = (value: number) => {
    // Tam tutarı göster (kısa format yerine)
    return value.toLocaleString('tr-TR') + '₺';
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('tr-TR');
  };

  const calculateDifference = (val1: number, val2: number) => {
    const diff = val2 - val1;
    const percentage = val1 > 0 ? ((diff / val1) * 100).toFixed(1) : '0';
    const sign = diff >= 0 ? '+' : '';
    return {
      diff,
      percentage,
      sign,
      isPositive: diff >= 0
    };
  };

  // Tarih formatla (timezone sorunlarını önlemek için)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hızlı tarih seçimi fonksiyonları
  const setQuickDateRange = (type: 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
    const today = new Date();
    let p1Start, p1End, p2Start, p2End;

    if (type === 'thisMonth') {
      // Bu Ay - İlk gün ve son gün
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Geçen Ay - İlk gün ve son gün
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      p1Start = lastMonthStart;
      p1End = lastMonthEnd;
      p2Start = thisMonthStart;
      p2End = thisMonthEnd;
    } else if (type === 'lastMonth') {
      // Geçen Ay
      p2Start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      p2End = new Date(today.getFullYear(), today.getMonth(), 0);
      // 2 Ay Önce
      p1Start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      p1End = new Date(today.getFullYear(), today.getMonth() - 1, 0);
    } else if (type === 'thisYear') {
      // Bu Yıl - 1 Ocak ve 31 Aralık
      const thisYearStart = new Date(today.getFullYear(), 0, 1);
      const thisYearEnd = new Date(today.getFullYear(), 11, 31);
      
      // Geçen Yıl - 1 Ocak ve 31 Aralık
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
      
      p1Start = lastYearStart;
      p1End = lastYearEnd;
      p2Start = thisYearStart;
      p2End = thisYearEnd;
    } else {
      // Geçen Yıl
      p2Start = new Date(today.getFullYear() - 1, 0, 1);
      p2End = new Date(today.getFullYear() - 1, 11, 31);
      // 2 Yıl Önce
      p1Start = new Date(today.getFullYear() - 2, 0, 1);
      p1End = new Date(today.getFullYear() - 2, 11, 31);
    }

    setPeriod1({
      start: formatDate(p1Start),
      end: formatDate(p1End)
    });
    setPeriod2({
      start: formatDate(p2Start),
      end: formatDate(p2End)
    });
  };

  // Ay seçimi fonksiyonu - İlk tıklama 1. dönem, ikinci tıklama 2. dönem
  const setMonthRange = (monthIndex: number) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Seçilen ayın ilk günü
    const monthStart = new Date(currentYear, monthIndex, 1);
    // Seçilen ayın son günü (bir sonraki ayın 0. günü = bu ayın son günü)
    const monthEnd = new Date(currentYear, monthIndex + 1, 0);
    
    if (nextPeriodToSet === 1) {
      // İlk tıklama - 1. Dönemi güncelle
      setPeriod1({
        start: formatDate(monthStart),
        end: formatDate(monthEnd)
      });
      setSelectedMonth1(monthIndex); // 1. dönem için seçili ayı kaydet
      setNextPeriodToSet(2); // Sıradaki tıklama 2. dönemi güncelleyecek
    } else {
      // İkinci tıklama - 2. Dönemi güncelle
      setPeriod2({
        start: formatDate(monthStart),
        end: formatDate(monthEnd)
      });
      setSelectedMonth2(monthIndex); // 2. dönem için seçili ayı kaydet
      setNextPeriodToSet(1); // Sıradaki tıklama tekrar 1. dönemi güncelleyecek
    }
  };

  // Favori karşılaştırmaları yükle
  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    try {
      const response = await fetch(`/api/comparison-favorites?userId=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  };

  const saveFavorite = async () => {
    if (!favoriteName.trim()) {
      alert('Lütfen favori için bir isim girin');
      return;
    }

    try {
      const response = await fetch('/api/comparison-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: favoriteName,
          description: favoriteDescription,
          userId: user?.id,
          period1Start: period1.start,
          period1End: period1.end,
          period2Start: period2.start,
          period2End: period2.end,
          selectedFirms: selectedFirms,
          isDefault: false
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadFavorites();
        setShowSaveDialog(false);
        setFavoriteName('');
        setFavoriteDescription('');
        alert('✅ Favori karşılaştırma kaydedildi!');
      }
    } catch (error) {
      console.error('Favori kaydedilirken hata:', error);
      alert('❌ Favori kaydedilemedi');
    }
  };

  const loadFavorite = (favorite: ComparisonFavorite) => {
    setPeriod1({
      start: favorite.period1Start,
      end: favorite.period1End
    });
    setPeriod2({
      start: favorite.period2Start,
      end: favorite.period2End
    });
    if (favorite.selectedFirms) {
      const firms = JSON.parse(favorite.selectedFirms);
      setSelectedFirms(firms);
    }
    // Otomatik çalıştır
    setTimeout(() => {
      runComparison();
    }, 500);
  };

  const deleteFavorite = async (id: string) => {
    if (!confirm('Bu favoriyi silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/comparison-favorites?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadFavorites();
        alert('✅ Favori silindi');
      }
    } catch (error) {
      console.error('Favori silinirken hata:', error);
      alert('❌ Favori silinemedi');
    }
  };

  // Grafik verileri hazırla
  const prepareChartData = () => {
    if (!period1Data || !period2Data) return [];

    return [
      {
        metric: 'Toplam Ciro',
        'Dönem 1': period1Data.totalSales,
        'Dönem 2': period2Data.totalSales
      },
      {
        metric: 'Müşteri Sayısı',
        'Dönem 1': period1Data.customerCount,
        'Dönem 2': period2Data.customerCount
      },
      {
        metric: 'Ort. Sepet',
        'Dönem 1': Math.round(period1Data.averageBasket),
        'Dönem 2': Math.round(period2Data.averageBasket)
      },
      {
        metric: 'İşlem Sayısı',
        'Dönem 1': period1Data.totalTransactions,
        'Dönem 2': period2Data.totalTransactions
      }
    ];
  };

  // Ödeme yöntemi karşılaştırma verileri
  const preparePaymentData = () => {
    if (!period1Data || !period2Data) return [];

    return [
      {
        method: 'Nakit',
        'Dönem 1': period1Data.cash,
        'Dönem 2': period2Data.cash
      },
      {
        method: 'Kredi Kartı',
        'Dönem 1': period1Data.creditCard,
        'Dönem 2': period2Data.creditCard
      },
      {
        method: 'Açık Hesap',
        'Dönem 1': period1Data.openAccount,
        'Dönem 2': period2Data.openAccount
      }
    ];
  };

  // Pasta grafik - Firma dağılımı (2. Dönem - Gerçek Veri)
  const preparePieData = () => {
    if (!period2Data || !period2RawData || period2RawData.length === 0) return [];
    
    // Ham veriden firma bazlı ciroları hesapla
    const firmaSales: { [key: string]: number } = {};
    
    period2RawData.forEach((item: any) => {
      const firma = item.Firma || 'Bilinmeyen';
      const ciro = item.GENEL_TOPLAM || 0;
      
      if (firmaSales[firma]) {
        firmaSales[firma] += ciro;
      } else {
        firmaSales[firma] = ciro;
      }
    });
    
    // Toplam ciroyu hesapla
    const totalSales = Object.values(firmaSales).reduce((sum, val) => sum + val, 0);
    
    if (totalSales === 0) return [];
    
    // Yüzdelik dağılımı hesapla ve büyükten küçüğe sırala
    return Object.entries(firmaSales)
      .map(([firma, sales]) => ({
        name: firma,
        value: Math.round((sales / totalSales) * 100 * 10) / 10, // Ondalık hassasiyeti
        sales: sales
      }))
      .sort((a, b) => b.sales - a.sales); // Ciro büyükten küçüğe
  };

  // Alan grafiği - Kümülatif ciro (Gerçek Günlük Veri)
  const prepareAreaData = () => {
    if (!period1Data || !period2Data || !period1RawData || !period2RawData) return [];
    
    // Her iki dönem için tarih bazlı ciroları topla
    const period1DailySales: { [key: string]: number } = {};
    const period2DailySales: { [key: string]: number } = {};
    
    // Period 1 - Günlük ciroları topla
    period1RawData.forEach((item: any) => {
      const date = item.Tarih || 'Bilinmeyen';
      const ciro = item.GENEL_TOPLAM || 0;
      
      if (period1DailySales[date]) {
        period1DailySales[date] += ciro;
      } else {
        period1DailySales[date] = ciro;
      }
    });
    
    // Period 2 - Günlük ciroları topla
    period2RawData.forEach((item: any) => {
      const date = item.Tarih || 'Bilinmeyen';
      const ciro = item.GENEL_TOPLAM || 0;
      
      if (period2DailySales[date]) {
        period2DailySales[date] += ciro;
      } else {
        period2DailySales[date] = ciro;
      }
    });
    
    // Tarihleri sırala ve kümülatif hesapla
    const dates1 = Object.keys(period1DailySales).sort();
    const dates2 = Object.keys(period2DailySales).sort();
    
    // Her iki dönemdeki maksimum gün sayısını al
    const maxDays = Math.max(dates1.length, dates2.length);
    
    let cumulative1 = 0;
    let cumulative2 = 0;
    const data = [];
    
    for (let i = 0; i < maxDays; i++) {
      if (dates1[i]) {
        cumulative1 += period1DailySales[dates1[i]];
      }
      if (dates2[i]) {
        cumulative2 += period2DailySales[dates2[i]];
      }
      
      // Tarih formatını düzenle (sadece gün-ay)
      const label1 = dates1[i] ? new Date(dates1[i]).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : '';
      const label2 = dates2[i] ? new Date(dates2[i]).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : '';
      const label = label1 || label2 || `Gün ${i + 1}`;
      
      data.push({
        day: label,
        'Dönem 1': cumulative1,
        'Dönem 2': cumulative2
      });
    }
    
    return data;
  };

  // Otomatik içgörüler oluştur
  const generateInsights = () => {
    if (!period1Data || !period2Data) return [];
    
    const insights = [];
    const revenueDiff = calculateDifference(period1Data.totalSales, period2Data.totalSales);
    const customerDiff = calculateDifference(period1Data.customerCount, period2Data.customerCount);
    const basketDiff = calculateDifference(period1Data.averageBasket, period2Data.averageBasket);
    
    // Ciro analizi
    if (Math.abs(parseFloat(revenueDiff.percentage)) > 10) {
      insights.push({
        type: revenueDiff.isPositive ? 'success' : 'warning',
        title: `Ciro ${revenueDiff.isPositive ? 'Artışı' : 'Düşüşü'}`,
        message: `2. dönemde ${revenueDiff.sign}${revenueDiff.percentage}% (${formatCurrency(Math.abs(revenueDiff.diff))}) ${revenueDiff.isPositive ? 'artış' : 'düşüş'} var.`,
        icon: revenueDiff.isPositive ? '📈' : '📉'
      });
    }
    
    // Müşteri analizi
    if (Math.abs(parseFloat(customerDiff.percentage)) > 15) {
      insights.push({
        type: customerDiff.isPositive ? 'success' : 'warning',
        title: 'Müşteri Sayısı Değişimi',
        message: `Müşteri sayısı ${customerDiff.sign}${customerDiff.percentage}% değişti. ${customerDiff.isPositive ? 'Yeni müşteriler kazanıldı!' : 'Müşteri kaybı yaşandı.'}`,
        icon: customerDiff.isPositive ? '👥' : '👤'
      });
    }
    
    // Sepet analizi
    if (Math.abs(parseFloat(basketDiff.percentage)) > 5) {
      insights.push({
        type: basketDiff.isPositive ? 'success' : 'info',
        title: 'Ortalama Sepet Değişimi',
        message: `Müşteri başına ortalama sepet ${basketDiff.sign}${basketDiff.percentage}% ${basketDiff.isPositive ? 'arttı' : 'azaldı'}.`,
        icon: '🛒'
      });
    }
    
    // Anomali tespiti
    if (Math.abs(parseFloat(revenueDiff.percentage)) > 50) {
      insights.push({
        type: 'alert',
        title: '⚠️ Anomali Tespit Edildi',
        message: `Ciroda %${Math.abs(parseFloat(revenueDiff.percentage))} gibi büyük bir değişim var. Detaylı inceleme önerilir.`,
        icon: '🚨'
      });
    }
    
    // Benchmark (varsayılan sektör ortalaması %5-10 büyüme)
    const sectorAvg = 7.5;
    const actualGrowth = parseFloat(revenueDiff.percentage);
    if (actualGrowth > sectorAvg) {
      insights.push({
        type: 'success',
        title: 'Sektör Ortalamasının Üzerinde',
        message: `Büyüme oranınız %${actualGrowth.toFixed(1)}, sektör ortalaması %${sectorAvg}. Harika performans! 🎉`,
        icon: '🏆'
      });
    } else if (actualGrowth < 0) {
      insights.push({
        type: 'warning',
        title: 'Sektör Ortalamasının Altında',
        message: `Sektör ortalaması %${sectorAvg} büyürken, ciironuz %${actualGrowth.toFixed(1)} değişti. İyileştirme fırsatı var.`,
        icon: '💡'
      });
    }
    
    return insights;
  };

  // WhatsApp paylaşım mesajı oluştur
  const shareToWhatsApp = () => {
    if (!period1Data || !period2Data) {
      alert('Önce karşılaştırmayı çalıştırın!');
      return;
    }
    
    const revenueDiff = calculateDifference(period1Data.totalSales, period2Data.totalSales);
    const message = `📊 *Karşılaştırma Raporu*\n\n` +
      `*1. Dönem:* ${period1.start} - ${period1.end}\n` +
      `Ciro: ${formatCurrency(period1Data.totalSales)}\n` +
      `Müşteri: ${formatNumber(period1Data.customerCount)}\n\n` +
      `*2. Dönem:* ${period2.start} - ${period2.end}\n` +
      `Ciro: ${formatCurrency(period2Data.totalSales)}\n` +
      `Müşteri: ${formatNumber(period2Data.customerCount)}\n\n` +
      `*Değişim:* ${revenueDiff.sign}${revenueDiff.percentage}% ${revenueDiff.isPositive ? '📈' : '📉'}\n\n` +
      `Detaylı rapor: ${window.location.href}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Gelecek dönem tahmini (trend-based basit algoritma)
  const generateForecast = () => {
    if (!period1Data || !period2Data) return null;
    
    // Dönemler arasındaki trend yüzdesini hesapla
    const revenueTrend = ((period2Data.totalSales - period1Data.totalSales) / period1Data.totalSales) * 100;
    const customerTrend = ((period2Data.customerCount - period1Data.customerCount) / period1Data.customerCount) * 100;
    const basketTrend = ((period2Data.averageBasket - period1Data.averageBasket) / period1Data.averageBasket) * 100;
    
    // Gelecek dönem tahmini (2. dönem + trend)
    const forecastRevenue = period2Data.totalSales * (1 + (revenueTrend / 100));
    const forecastCustomers = Math.round(period2Data.customerCount * (1 + (customerTrend / 100)));
    const forecastBasket = period2Data.averageBasket * (1 + (basketTrend / 100));
    
    // Tahmin güvenilirliği (trend ne kadar kararlı)
    const avgTrend = (Math.abs(revenueTrend) + Math.abs(customerTrend) + Math.abs(basketTrend)) / 3;
    const confidence = avgTrend < 30 ? 'Yüksek' : avgTrend < 60 ? 'Orta' : 'Düşük';
    
    return {
      revenue: forecastRevenue,
      customers: forecastCustomers,
      basket: forecastBasket,
      revenueTrend,
      customerTrend,
      basketTrend,
      confidence
    };
  };

  // Tema renklerini al
  const getThemeColors = () => {
    const themes = {
      blue: { primary: '#3b82f6', secondary: '#a855f7', gradient: 'from-blue-600 to-purple-600' },
      green: { primary: '#10b981', secondary: '#059669', gradient: 'from-green-600 to-emerald-600' },
      purple: { primary: '#a855f7', secondary: '#ec4899', gradient: 'from-purple-600 to-pink-600' },
      orange: { primary: '#f97316', secondary: '#ef4444', gradient: 'from-orange-600 to-red-600' }
    };
    return themes[colorTheme];
  };

  // Pasta grafik için renk dizisi
  const getThemeColorsArray = () => {
    const colorArrays = {
      blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#1e40af', '#2563eb'],
      green: ['#10b981', '#34d399', '#6ee7b7', '#d1fae5', '#059669', '#047857'],
      purple: ['#a855f7', '#c084fc', '#e9d5ff', '#f3e8ff', '#9333ea', '#7c3aed'],
      orange: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ea580c', '#dc2626']
    };
    return colorArrays[colorTheme];
  };

  // Firma seçimi değiştiğinde manuel güncelleme
  const handleFirmToggle = (firm: string) => {
    // Mevcut selectedFirms state'ini kullanarak yeni seçimi hesapla
    const currentSelection = selectedFirms;
    const newSelection = currentSelection.includes(firm) 
      ? currentSelection.filter(f => f !== firm)
      : [...currentSelection, firm];
    
    console.log('🔄 Firma Toggle:', {
      firma: firm,
      mevcutSeçim: currentSelection,
      yeniSeçim: newSelection,
      firmaSeçiliMi: currentSelection.includes(firm)
    });
    
    setSelectedFirms(newSelection);
    
    // Doğrudan yeni seçimi parametre olarak geç
    console.log('🔄 Firma Toggle - Karşılaştırma güncelleniyor...');
    runComparison(newSelection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ArrowLeftRight className="h-10 w-10 text-blue-500" />
              Karşılaştırma Modu
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              İki dönem arasında detaylı karşılaştırma yapın
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => runComparison()} 
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Karşılaştırmayı Çalıştır
                </>
              )}
            </Button>
            <Button className="gap-2" variant="outline" disabled={!period1Data || !period2Data}>
            <Download className="h-4 w-4" />
            Excel İndir
          </Button>
        </div>
        </div>

        {/* Hızlı Tarih Seçimi */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hızlı Karşılaştırma</h3>
          </div>
          
          {/* Dönem Butonları */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={() => setQuickDateRange('thisMonth')}
              variant="outline"
              className="gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-100"
            >
              <Clock className="h-4 w-4" />
              Bu Ay vs Geçen Ay
            </Button>
            <Button
              onClick={() => setQuickDateRange('thisYear')}
              variant="outline"
              className="gap-2 border-purple-300 text-purple-600 hover:bg-purple-100"
            >
              <Calendar className="h-4 w-4" />
              Bu Yıl vs Geçen Yıl
            </Button>
            <Button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              variant="outline"
              className="gap-2 border-yellow-300 text-yellow-600 hover:bg-yellow-100"
            >
              <Save className="h-4 w-4" />
              Favori Olarak Kaydet
            </Button>
          </div>

          {/* Ay Butonları */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Aylık Seçim (Seçilen ayın 1. günü - Son günü)</h4>
              <div className="text-xs text-gray-600">
                Sıradaki tıklama: 
                {nextPeriodToSet === 1 ? (
                  <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">1. Dönem</span>
                ) : (
                  <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">2. Dönem</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: 'Ocak', index: 0 },
                { name: 'Şubat', index: 1 },
                { name: 'Mart', index: 2 },
                { name: 'Nisan', index: 3 },
                { name: 'Mayıs', index: 4 },
                { name: 'Haziran', index: 5 },
                { name: 'Temmuz', index: 6 },
                { name: 'Ağustos', index: 7 },
                { name: 'Eylül', index: 8 },
                { name: 'Ekim', index: 9 },
                { name: 'Kasım', index: 10 },
                { name: 'Aralık', index: 11 }
              ].map((month) => {
                const isMonth1 = selectedMonth1 === month.index;
                const isMonth2 = selectedMonth2 === month.index;
                
                let buttonClass = "text-xs transition-all duration-200";
                
                if (isMonth1 && isMonth2) {
                  // Her iki dönem de aynı ay - Gradient
                  buttonClass += " bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent font-bold";
                } else if (isMonth1) {
                  // 1. Dönem - Mavi
                  buttonClass += " bg-blue-500 text-white border-blue-600 font-semibold hover:bg-blue-600";
                } else if (isMonth2) {
                  // 2. Dönem - Mor
                  buttonClass += " bg-purple-500 text-white border-purple-600 font-semibold hover:bg-purple-600";
                } else {
                  // Seçili değil - Normal
                  buttonClass += " border-gray-300 text-gray-700 hover:bg-gray-100";
                }
                
                return (
                  <Button
                    key={month.index}
                    onClick={() => setMonthRange(month.index)}
                    variant="outline"
                    size="sm"
                    className={buttonClass}
                  >
                    {month.name}
                  </Button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>1. Dönem</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>2. Dönem</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                <span>Her İki Dönem</span>
              </div>
            </div>
          </div>

          {/* Favori Kaydetme Dialogu */}
          {showSaveDialog && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-yellow-200">
              <h4 className="font-bold mb-3 text-gray-900">Favori Karşılaştırma Kaydet</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Favori İsmi (örn: Aylık Performans)"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Açıklama (opsiyonel)"
                  value={favoriteDescription}
                  onChange={(e) => setFavoriteDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={saveFavorite} className="flex-1">
                    Kaydet
                  </Button>
                  <Button onClick={() => setShowSaveDialog(false)} variant="outline">
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Kaydedilmiş Favoriler */}
        {favorites.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kaydedilmiş Karşılaştırmalar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="p-4 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer group"
                  onClick={() => loadFavorite(fav)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{fav.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFavorite(fav.id);
                      }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                  {fav.description && (
                    <p className="text-sm text-gray-600 mb-2">{fav.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    <div>Dönem 1: {fav.period1Start} - {fav.period1End}</div>
                    <div>Dönem 2: {fav.period2Start} - {fav.period2End}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </Card>
        )}

        {/* Firma Filtresi */}
        {availableFirms.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Firma Filtresi</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <Button
                onClick={handleToggleAllFirms}
                variant={selectedFirms.length === availableFirms.length ? "default" : "outline"}
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-100"
              >
                {selectedFirms.length === availableFirms.length ? "Tümünü Kaldır" : "Tümünü Seç"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableFirms.map((firm) => (
                <Button
                  key={firm}
                  onClick={() => handleFirmToggle(firm)}
                  variant={selectedFirms.includes(firm) ? "default" : "outline"}
                  size="sm"
                  className={`transition-all duration-200 ${
                    selectedFirms.includes(firm)
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "text-green-600 border-green-300 hover:bg-green-100"
                  }`}
                >
                  {firm}
                </Button>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Seçili: {selectedFirms.length} / {availableFirms.length} firma
            </div>
          </Card>
        )}

        {/* Period Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period 1 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Dönem</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç</label>
                <input
                  type="date"
                  value={period1.start}
                  onChange={(e) => setPeriod1({ ...period1, start: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş</label>
                <input
                  type="date"
                  value={period1.end}
                  onChange={(e) => setPeriod1({ ...period1, end: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Period 2 */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Dönem</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç</label>
                <input
                  type="date"
                  value={period2.start}
                  onChange={(e) => setPeriod2({ ...period2, start: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bitiş</label>
                <input
                  type="date"
                  value={period2.end}
                  onChange={(e) => setPeriod2({ ...period2, end: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison Results */}
        {period1Data && period2Data ? (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Toplam Ciro */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Toplam Ciro</h4>
                <TrendingUp className={`h-5 w-5 ${calculateDifference(period1Data.totalSales, period2Data.totalSales).isPositive ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                  <span className="font-bold text-blue-600">{formatCurrency(period1Data.totalSales)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                  <span className="font-bold text-purple-600">{formatCurrency(period2Data.totalSales)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                    <span className={`font-bold ${calculateDifference(period1Data.totalSales, period2Data.totalSales).isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateDifference(period1Data.totalSales, period2Data.totalSales).sign}{formatCurrency(Math.abs(calculateDifference(period1Data.totalSales, period2Data.totalSales).diff))} ({calculateDifference(period1Data.totalSales, period2Data.totalSales).sign}{calculateDifference(period1Data.totalSales, period2Data.totalSales).percentage}%)
                    </span>
                  </div>
                </div>
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Nakit + Kredi</span>
                    <span className="text-gray-700">{formatCurrency((period1Data.cash + period1Data.creditCard) + (period2Data.cash + period2Data.creditCard))}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Açık Hesap</span>
                    <span className="text-gray-700">{formatCurrency(period1Data.openAccount + period2Data.openAccount)}</span>
                </div>
              </div>
            </div>
          </Card>

            {/* Müşteri Sayısı */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Müşteri Sayısı</h4>
                <BarChart3 className={`h-5 w-5 ${calculateDifference(period1Data.customerCount, period2Data.customerCount).isPositive ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                  <span className="font-bold text-blue-600">{formatNumber(period1Data.customerCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                  <span className="font-bold text-purple-600">{formatNumber(period2Data.customerCount)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                    <span className={`font-bold ${calculateDifference(period1Data.customerCount, period2Data.customerCount).isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateDifference(period1Data.customerCount, period2Data.customerCount).sign}{formatNumber(Math.abs(calculateDifference(period1Data.customerCount, period2Data.customerCount).diff))} ({calculateDifference(period1Data.customerCount, period2Data.customerCount).sign}{calculateDifference(period1Data.customerCount, period2Data.customerCount).percentage}%)
                    </span>
                </div>
              </div>
            </div>
          </Card>

            {/* Ortalama Sepet */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Ort. Sepet</h4>
                <TrendingUp className={`h-5 w-5 ${calculateDifference(period1Data.averageBasket, period2Data.averageBasket).isPositive ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">1. Dönem</span>
                  <span className="font-bold text-blue-600">{formatCurrency(period1Data.averageBasket)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2. Dönem</span>
                  <span className="font-bold text-purple-600">{formatCurrency(period2Data.averageBasket)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fark</span>
                    <span className={`font-bold ${calculateDifference(period1Data.averageBasket, period2Data.averageBasket).isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateDifference(period1Data.averageBasket, period2Data.averageBasket).sign}{formatCurrency(Math.abs(calculateDifference(period1Data.averageBasket, period2Data.averageBasket).diff))} ({calculateDifference(period1Data.averageBasket, period2Data.averageBasket).sign}{calculateDifference(period1Data.averageBasket, period2Data.averageBasket).percentage}%)
                    </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              Karşılaştırma yapmak için "Karşılaştırmayı Çalıştır" butonuna tıklayın
            </p>
          </Card>
        )}

        {/* Side-by-Side Comparison - Dönem Detayları */}
        {period1Data && period2Data && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period 1 Details */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <h3 className="text-xl font-bold text-blue-600 mb-6">1. Dönem Detayları</h3>
            <div className="space-y-4">
              {[
                  { label: 'Toplam İşlem', value: formatNumber(period1Data.totalTransactions) },
                  { label: 'Firmalar', value: period1Data.firmas.join(', ') || 'Veri yok' },
                  { label: 'Toplam Satış', value: formatCurrency(period1Data.totalSales) },
                  { label: 'Nakit', value: formatCurrency(period1Data.cash) },
                  { label: 'Kredi Kartı', value: formatCurrency(period1Data.creditCard) },
                  { label: 'Açık Hesap', value: formatCurrency(period1Data.openAccount) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Period 2 Details */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
            <h3 className="text-xl font-bold text-purple-600 mb-6">2. Dönem Detayları</h3>
            <div className="space-y-4">
              {[
                { label: 'Toplam İşlem', value: formatNumber(period2Data.totalTransactions) },
                { label: 'Firmalar', value: period2Data.firmas.join(', ') || 'Veri yok' },
                { label: 'Toplam Satış', value: formatCurrency(period2Data.totalSales) },
                { label: 'Nakit', value: formatCurrency(period2Data.cash) },
                { label: 'Kredi Kartı', value: formatCurrency(period2Data.creditCard) },
                { label: 'Açık Hesap', value: formatCurrency(period2Data.openAccount) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        )}

        {/* Grafik ve Görselleştirmeler */}
        {period1Data && period2Data && (
          <>
            {/* Ana Metrikler Karşılaştırma Grafiği */}
            <Card className="p-6 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Metrik Karşılaştırması
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Dönem 1" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Dönem 2" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Ödeme Yöntemi Karşılaştırma */}
            <Card className="p-6 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Ödeme Yöntemi Dağılımı
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={preparePaymentData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Dönem 1" fill="#10b981" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="Dönem 2" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Firma Dağılımı - Pasta Grafik (Canlı Veri) */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                Firma Dağılımı - 2. Dönem (Canlı Veri)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getThemeColorsArray()[index % getThemeColorsArray().length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [
                      `${value.toFixed(1)}% (${formatCurrency(props.payload.sales)})`,
                      'Pay'
                    ]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              {preparePieData().length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {preparePieData().map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600">{formatCurrency(item.sales)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Kümülatif Ciro - Alan Grafiği (Canlı Veri) */}
            <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-cyan-600" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Kümülatif Ciro Gösterimi
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    📡 CANLI VERİ
                  </span>
                </div>
              </div>
              
              {/* Özet İstatistikler */}
              {prepareAreaData().length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">1. Dönem Toplam</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(period1Data?.totalSales || 0)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-2 border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">2. Dönem Toplam</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(period2Data?.totalSales || 0)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-2 border-cyan-200">
                    <p className="text-xs text-gray-600 mb-1">1. Dönem Gün Sayısı</p>
                    <p className="text-lg font-bold text-cyan-600">{period1RawData.length > 0 ? Object.keys(period1RawData.reduce((acc: any, item: any) => { acc[item.Tarih] = true; return acc; }, {})).length : 0} gün</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-2 border-indigo-200">
                    <p className="text-xs text-gray-600 mb-1">2. Dönem Gün Sayısı</p>
                    <p className="text-lg font-bold text-indigo-600">{period2RawData.length > 0 ? Object.keys(period2RawData.reduce((acc: any, item: any) => { acc[item.Tarih] = true; return acc; }, {})).length : 0} gün</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Her günün cirosunun kümülatif toplamı - API'den gelen gerçek tarih ve ciro verileri
              </p>
              
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart data={prepareAreaData()}>
                  <defs>
                    <linearGradient id="colorPeriod1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPeriod2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value).replace(',00', '')}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Kümülatif Ciro']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #06b6d4', 
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Dönem 1" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPeriod1)"
                    animationBegin={0}
                    animationDuration={1200}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Dönem 2" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPeriod2)"
                    animationBegin={200}
                    animationDuration={1200}
                    dot={{ fill: '#a855f7', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Veri Kaynağı Bilgisi */}
              <div className="mt-4 p-3 bg-cyan-100 rounded-lg text-sm">
                <p className="font-semibold text-cyan-900 mb-1">💡 Grafik Bilgisi:</p>
                <ul className="text-cyan-800 space-y-1 text-xs">
                  <li>✓ Ham veriden günlük cirolar toplanıyor (Tarih + GENEL_TOPLAM)</li>
                  <li>✓ Tarihler kronolojik sıralanıyor</li>
                  <li>✓ Her gün için o güne kadarki toplam ciro gösteriliyor</li>
                  <li>✓ Seçili firmaların tüm işlemleri dahil</li>
                </ul>
              </div>
            </Card>

            {/* Otomatik İçgörüler ve AI Yorumları */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-amber-600" />
                Otomatik İçgörüler
              </h3>
              <div className="space-y-3">
                {generateInsights().map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-200' :
                      insight.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                      insight.type === 'danger' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {insight.type === 'success' && <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />}
                      {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />}
                      {insight.type === 'danger' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                      {insight.type === 'info' && <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          insight.type === 'success' ? 'text-green-900' :
                          insight.type === 'warning' ? 'text-orange-900' :
                          insight.type === 'danger' ? 'text-red-900' :
                          'text-blue-900'
                        }`}>
                          {insight.title}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tema Seçenekleri ve WhatsApp Paylaş */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tema Seçenekleri */}
              <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Palette className="h-6 w-6 text-pink-600" />
                  Tema Renkleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'blue', label: 'Mavi', colors: ['#3b82f6', '#60a5fa', '#93c5fd'] },
                    { name: 'green', label: 'Yeşil', colors: ['#10b981', '#34d399', '#6ee7b7'] },
                    { name: 'purple', label: 'Mor', colors: ['#a855f7', '#c084fc', '#e9d5ff'] },
                    { name: 'orange', label: 'Turuncu', colors: ['#f97316', '#fb923c', '#fdba74'] }
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setColorTheme(theme.name as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        colorTheme === theme.name 
                          ? 'border-gray-900 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{theme.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {theme.colors.map((color, idx) => (
                          <div 
                            key={idx}
                            className="flex-1 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* WhatsApp Paylaş */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-green-600" />
                  Raporu Paylaş
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Karşılaştırma sonuçlarını WhatsApp üzerinden hızlıca paylaşabilirsiniz.
                  </p>
                  <Button 
                    onClick={shareToWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    size="lg"
                  >
                    <Share2 className="h-5 w-5" />
                    WhatsApp ile Paylaş
                  </Button>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Toplam ciro karşılaştırması</p>
                    <p>✓ Müşteri sayısı farkı</p>
                    <p>✓ Ortalama sepet analizi</p>
                    <p>✓ Dönem detayları</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gelecek Dönem Tahmini */}
            {generateForecast() && (
              <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Zap className="h-6 w-6 text-violet-600" />
                  Gelecek Dönem Tahmini
                  <span className={`ml-auto text-sm px-3 py-1 rounded-full ${
                    generateForecast()!.confidence === 'Yüksek' ? 'bg-green-100 text-green-700' :
                    generateForecast()!.confidence === 'Orta' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Güvenilirlik: {generateForecast()!.confidence}
                  </span>
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border-2 border-violet-200">
                    <p className="text-sm text-gray-600 mb-1">Tahmini Ciro</p>
                    <p className="text-2xl font-bold text-violet-600">{formatCurrency(generateForecast()!.revenue)}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Trend: {generateForecast()!.revenueTrend > 0 ? '↗️' : '↘️'} {generateForecast()!.revenueTrend.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-violet-200">
                    <p className="text-sm text-gray-600 mb-1">Tahmini Müşteri</p>
                    <p className="text-2xl font-bold text-violet-600">{formatNumber(generateForecast()!.customers)}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Trend: {generateForecast()!.customerTrend > 0 ? '↗️' : '↘️'} {generateForecast()!.customerTrend.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-violet-200">
                    <p className="text-sm text-gray-600 mb-1">Tahmini Ort. Sepet</p>
                    <p className="text-2xl font-bold text-violet-600">{formatCurrency(generateForecast()!.basket)}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Trend: {generateForecast()!.basketTrend > 0 ? '↗️' : '↘️'} {generateForecast()!.basketTrend.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="bg-violet-100 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">💡 Tahmin Notu:</p>
                  <p>
                    Bu tahmin, son iki dönem arasındaki trend analizi ile yapılmıştır. 
                    Mevsimsellik, pazar koşulları ve özel durumlar tahmin doğruluğunu etkileyebilir.
                    {generateForecast()!.confidence === 'Düşük' && ' Yüksek değişkenlik nedeniyle dikkatli yorumlanmalıdır.'}
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

