'use client'

import { useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

export interface Toast {
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

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const Icon = toastIcons[toast.type]
  
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration])
  
  const handleRemove = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }, [toast.id, onRemove])
  
  return (
    <div
      className={clsx(
        'max-w-sm w-full sm:w-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg pointer-events-auto transition-all duration-300 ease-in-out',
        toastColors[toast.type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toast.action.onClick}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

// Toast Hook
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string, options?: Partial<Toast>) => void
  error: (title: string, message?: string, options?: Partial<Toast>) => void
  warning: (title: string, message?: string, options?: Partial<Toast>) => void
  info: (title: string, message?: string, options?: Partial<Toast>) => void
}

let toastId = 0
const generateToastId = () => `toast-${++toastId}-${Date.now()}`

export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateToastId()
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])
  
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'success', title, message, ...options })
  }, [addToast])
  
  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'error', title, message, ...options })
  }, [addToast])
  
  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'warning', title, message, ...options })
  }, [addToast])
  
  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'info', title, message, ...options })
  }, [addToast])
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast()
  
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
