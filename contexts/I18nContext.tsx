'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Translations {
  [key: string]: string | Translations
}

interface I18nContextType {
  language: string
  setLanguage: (language: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
  availableLanguages: Array<{
    code: string
    name: string
    flag: string
  }>
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation files
const translations: Record<string, Translations> = {
  tr: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Raporlar',
    'nav.products': 'Ürünler',
    'nav.settings': 'Ayarlar',
    'nav.logout': 'Çıkış Yap',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Hoş Geldiniz',
    'dashboard.totalSales': 'Toplam Satış',
    'dashboard.customers': 'Müşteriler',
    'dashboard.orders': 'Siparişler',
    'dashboard.growth': 'Büyüme',
    'dashboard.dailySales': 'Günlük Satış Trendi',
    'dashboard.paymentMethods': 'Ödeme Yöntemleri',
    'dashboard.topCustomers': 'En İyi Müşteriler',
    'dashboard.quickActions': 'Hızlı İşlemler',
    
    // Widgets
    'widget.add': 'Widget Ekle',
    'widget.edit': 'Widget Düzenle',
    'widget.delete': 'Widget Sil',
    'widget.save': 'Widget Kaydet',
    'widget.cancel': 'İptal',
    'widget.settings': 'Widget Ayarları',
    'widget.refresh': 'Yenile',
    'widget.fullscreen': 'Tam Ekran',
    
    // Filters
    'filter.title': 'Filtreler',
    'filter.apply': 'Uygula',
    'filter.clear': 'Temizle',
    'filter.reset': 'Sıfırla',
    'filter.search': 'Ara',
    'filter.dateRange': 'Tarih Aralığı',
    'filter.category': 'Kategori',
    'filter.status': 'Durum',
    
    // Notifications
    'notification.title': 'Bildirimler',
    'notification.markAllRead': 'Tümünü Okundu İşaretle',
    'notification.clearAll': 'Tümünü Temizle',
    'notification.noNotifications': 'Henüz bildirim yok',
    'notification.thresholdAlert': 'Eşik Uyarısı',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.warning': 'Uyarı',
    'common.info': 'Bilgi',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.add': 'Ekle',
    'common.close': 'Kapat',
    'common.confirm': 'Onayla',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.export': 'Dışa Aktar',
    'common.import': 'İçe Aktar',
    'common.refresh': 'Yenile',
    'common.reset': 'Sıfırla',
    'common.back': 'Geri',
    'common.next': 'İleri',
    'common.previous': 'Önceki',
    'common.total': 'Toplam',
    'common.page': 'Sayfa',
    'common.of': 'of',
    'common.items': 'öğe',
    'common.perPage': 'Sayfa başına',
    
    // Time
    'time.now': 'Şimdi',
    'time.minutesAgo': '{count} dakika önce',
    'time.hoursAgo': '{count} saat önce',
    'time.daysAgo': '{count} gün önce',
    'time.today': 'Bugün',
    'time.yesterday': 'Dün',
    'time.thisWeek': 'Bu Hafta',
    'time.lastWeek': 'Geçen Hafta',
    'time.thisMonth': 'Bu Ay',
    'time.lastMonth': 'Geçen Ay',
    'time.thisYear': 'Bu Yıl',
    'time.lastYear': 'Geçen Yıl',
    
    // Validation
    'validation.required': 'Bu alan zorunludur',
    'validation.email': 'Geçerli bir e-posta adresi girin',
    'validation.minLength': 'En az {min} karakter olmalıdır',
    'validation.maxLength': 'En fazla {max} karakter olabilir',
    'validation.numeric': 'Sadece sayı girebilirsiniz',
    'validation.positive': 'Pozitif bir sayı girin',
    
    // Messages
    'message.success': 'İşlem başarıyla tamamlandı',
    'message.error': 'Bir hata oluştu',
    'message.loading': 'Veriler yükleniyor...',
    'message.noData': 'Veri bulunamadı',
    'message.confirmDelete': 'Bu öğeyi silmek istediğinizden emin misiniz?',
    'message.unsavedChanges': 'Kaydedilmemiş değişiklikler var. Sayfadan çıkmak istediğinizden emin misiniz?'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.products': 'Products',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.customers': 'Customers',
    'dashboard.orders': 'Orders',
    'dashboard.growth': 'Growth',
    'dashboard.dailySales': 'Daily Sales Trend',
    'dashboard.paymentMethods': 'Payment Methods',
    'dashboard.topCustomers': 'Top Customers',
    'dashboard.quickActions': 'Quick Actions',
    
    // Widgets
    'widget.add': 'Add Widget',
    'widget.edit': 'Edit Widget',
    'widget.delete': 'Delete Widget',
    'widget.save': 'Save Widget',
    'widget.cancel': 'Cancel',
    'widget.settings': 'Widget Settings',
    'widget.refresh': 'Refresh',
    'widget.fullscreen': 'Fullscreen',
    
    // Filters
    'filter.title': 'Filters',
    'filter.apply': 'Apply',
    'filter.clear': 'Clear',
    'filter.reset': 'Reset',
    'filter.search': 'Search',
    'filter.dateRange': 'Date Range',
    'filter.category': 'Category',
    'filter.status': 'Status',
    
    // Notifications
    'notification.title': 'Notifications',
    'notification.markAllRead': 'Mark All Read',
    'notification.clearAll': 'Clear All',
    'notification.noNotifications': 'No notifications yet',
    'notification.thresholdAlert': 'Threshold Alert',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.reset': 'Reset',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.total': 'Total',
    'common.page': 'Page',
    'common.of': 'of',
    'common.items': 'items',
    'common.perPage': 'per page',
    
    // Time
    'time.now': 'Now',
    'time.minutesAgo': '{count} minutes ago',
    'time.hoursAgo': '{count} hours ago',
    'time.daysAgo': '{count} days ago',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.lastWeek': 'Last Week',
    'time.thisMonth': 'This Month',
    'time.lastMonth': 'Last Month',
    'time.thisYear': 'This Year',
    'time.lastYear': 'Last Year',
    
    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.minLength': 'Must be at least {min} characters',
    'validation.maxLength': 'Must be at most {max} characters',
    'validation.numeric': 'Only numbers are allowed',
    'validation.positive': 'Please enter a positive number',
    
    // Messages
    'message.success': 'Operation completed successfully',
    'message.error': 'An error occurred',
    'message.loading': 'Loading data...',
    'message.noData': 'No data found',
    'message.confirmDelete': 'Are you sure you want to delete this item?',
    'message.unsavedChanges': 'You have unsaved changes. Are you sure you want to leave this page?'
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('tr')
  const [isLoading, setIsLoading] = useState(false)

  const availableLanguages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when changed
  const handleSetLanguage = (newLanguage: string) => {
    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      setLanguage(newLanguage)
      localStorage.setItem('language', newLanguage)
      
      // Update document language attribute
      document.documentElement.lang = newLanguage
      
      setIsLoading(false)
    }, 300)
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to Turkish if key not found
        value = translations['tr']
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found in fallback either
          }
        }
        break
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }

  return (
    <I18nContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      availableLanguages,
      isLoading
    }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}




