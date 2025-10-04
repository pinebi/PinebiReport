// Application constants

export const APP_CONFIG = {
  name: 'Pinebi Report',
  version: '1.0.0',
  description: 'Gelişmiş raporlama ve analiz sistemi',
  author: 'Pinebi',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@pinebi.com',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  supportedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTime: 5 * 60 * 1000, // 5 minutes
} as const

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  reports: '/reports',
  reportsDashboard: '/reports/dashboard',
  reportsCategory: '/reports/category',
  reportsRun: '/reports/run',
  products: '/products',
  productsFormBuilder: '/products/form-builder',
  companies: '/companies',
  users: '/users',
  settings: '/settings',
  login: '/login',
  profile: '/profile',
} as const

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  REPORTER: 'REPORTER',
} as const

export const PERMISSIONS = {
  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  REPORTS_EDIT: 'reports:edit',
  REPORTS_DELETE: 'reports:delete',
  REPORTS_RUN: 'reports:run',
  
  // User permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  
  // Company permissions
  COMPANIES_VIEW: 'companies:view',
  COMPANIES_CREATE: 'companies:create',
  COMPANIES_EDIT: 'companies:edit',
  COMPANIES_DELETE: 'companies:delete',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: [...Object.values(PERMISSIONS)] as string[],
  [USER_ROLES.USER]: [
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_RUN,
    PERMISSIONS.SETTINGS_VIEW,
  ] as string[],
  [USER_ROLES.REPORTER]: [
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_RUN,
  ] as string[],
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  BLUE: 'blue',
  GREEN: 'green',
} as const

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter',
  RADAR: 'radar',
} as const

export const WIDGET_TYPES = {
  CHART: 'chart',
  TABLE: 'table',
  METRIC: 'metric',
  TEXT: 'text',
  KPI: 'kpi',
  PROGRESS: 'progress',
} as const

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DD',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_THEME: 'user_theme',
  REPORT_CATEGORIES: 'report_categories',
  REPORT_CONFIGS: 'report_configs',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  USER_PREFERENCES: 'user_preferences',
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME_CONFIG: 'theme_config',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  SIDEBAR_STATE: 'sidebar_state',
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edin.',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmuyor.',
  FORBIDDEN: 'Bu kaynağa erişim yetkiniz yok.',
  NOT_FOUND: 'Aradığınız kaynak bulunamadı.',
  SERVER_ERROR: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Girilen bilgiler geçersiz. Lütfen kontrol edin.',
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.',
  INVALID_FILE_TYPE: 'Geçersiz dosya türü.',
  GENERIC_ERROR: 'Beklenmeyen bir hata oluştu.',
} as const

export const SUCCESS_MESSAGES = {
  SAVED: 'Kayıt başarıyla kaydedildi.',
  UPDATED: 'Kayıt başarıyla güncellendi.',
  DELETED: 'Kayıt başarıyla silindi.',
  CREATED: 'Kayıt başarıyla oluşturuldu.',
  UPLOADED: 'Dosya başarıyla yüklendi.',
  EXPORTED: 'Veri başarıyla dışa aktarıldı.',
  IMPORTED: 'Veri başarıyla içe aktarıldı.',
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

export const Z_INDEX = {
  DROPDOWN: 50,
  MODAL: 100,
  TOAST: 9999,
  LOADING: 10000,
} as const

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#64748B',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
} as const