'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useToast as useToastHook, Toast } from '@/components/ui/toast'

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string, options?: Partial<Toast>) => void
  error: (title: string, message?: string, options?: Partial<Toast>) => void
  warning: (title: string, message?: string, options?: Partial<Toast>) => void
  info: (title: string, message?: string, options?: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastHook = useToastHook()
  
  return (
    <ToastContext.Provider value={toastHook}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
















