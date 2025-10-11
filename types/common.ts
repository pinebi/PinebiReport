// Common types used throughout the application

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterOptions {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike'
  value: any
}

export interface SearchOptions {
  query: string
  fields: string[]
  caseSensitive?: boolean
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: any) => React.ReactNode
}

export interface ThemeConfig {
  themeName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  sidebarColor: string
  borderRadius: string
  fontSize: string
  fontFamily: string
  darkMode: boolean
}

export interface User {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'USER' | 'REPORTER'
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

export interface ReportCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
  parentId?: string
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  name: string
  description?: string
  categoryId: string
  category: ReportCategory
  config: any
  isActive: boolean
  showInMenu: boolean
  menuOrder?: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'text'
  title: string
  config: any
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  isVisible: boolean
  refreshInterval?: number
}

export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    url: string
  }
}

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  href: string
  children?: MenuItem[]
  permissions?: string[]
  isActive?: boolean
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event types
export interface CustomEvent<T = any> extends Event {
  detail: T
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

export interface LoadingComponentProps extends BaseComponentProps {
  loading?: boolean
  skeleton?: boolean
  error?: string | null
  retry?: () => void
}

export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: (data: any) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  error?: string | null
  disabled?: boolean
}
















