export interface Company {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  taxNumber: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  companyId: string
  company?: Company
  role: 'admin' | 'user' | 'viewer'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReportCategory {
  id: string
  name: string
  description: string
  parentId?: string
  parent?: ReportCategory
  children?: ReportCategory[]
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReportConfig {
  id: string
  name: string
  description: string
  endpointUrl: string
  apiUsername: string
  apiPassword: string
  headers: Record<string, string>
  categoryId: string
  category?: ReportCategory
  companyId: string
  company?: Company
  userId: string
  user?: User
  isActive: boolean
  showInMenu: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface DashboardWidget {
  id: string
  userId: string
  widgetType: 'kpi' | 'chart' | 'table' | 'gauge' | 'progress' | 'text' | 'image' | 'iframe'
  title: string
  description?: string
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  size: {
    width: number
    height: number
  }
  config: Record<string, any>
  dataSource?: string
  refreshRate: number
  isVisible: boolean
  isCollapsed: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface DashboardLayout {
  id: string
  userId: string
  name: string
  isDefault: boolean
  layout: Record<string, any>
  widgets: DashboardWidget[]
  gridSize: string
  breakpoints?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface WidgetTemplate {
  id: string
  name: string
  description: string
  widgetType: DashboardWidget['widgetType']
  icon: string
  category: string
  config: Record<string, any>
  preview: string
  isActive: boolean
}
