'use client'

import { useCallback } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  context?: string
  fallbackMessage?: string
}

export function useErrorHandler() {
  const { error: showErrorToast } = useToast()

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      context = 'Unknown',
      fallbackMessage = 'Beklenmeyen bir hata oluştu'
    } = options

    // Extract error message
    let errorMessage = fallbackMessage
    let errorDetails = ''

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || ''
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      const err = error as any
      errorMessage = err.message || err.error || fallbackMessage
      errorDetails = err.details || ''
    }

    // Log error
    if (logError) {
      console.error(`[${context}] Error:`, {
        message: errorMessage,
        details: errorDetails,
        originalError: error
      })
    }

    // Show toast
    if (showToast) {
      showErrorToast(
        'Hata Oluştu',
        errorMessage,
        { duration: 5000 }
      )
    }

    return {
      message: errorMessage,
      details: errorDetails,
      originalError: error
    }
  }, [showErrorToast])

  // API error handler
  const handleApiError = useCallback((
    error: any,
    context: string = 'API'
  ) => {
    let message = 'API hatası oluştu'
    let details = ''

    if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.response?.data?.error) {
      message = error.response.data.error
    } else if (error?.message) {
      message = error.message
    }

    if (error?.response?.status) {
      details = `HTTP ${error.response.status}`
    }

    return handleError(error, {
      showToast: true,
      logError: true,
      context,
      fallbackMessage: message
    })
  }, [handleError])

  // Network error handler
  const handleNetworkError = useCallback((
    error: any,
    context: string = 'Network'
  ) => {
    let message = 'Bağlantı hatası oluştu'
    
    if (error?.code === 'NETWORK_ERROR') {
      message = 'İnternet bağlantınızı kontrol edin'
    } else if (error?.code === 'TIMEOUT') {
      message = 'İstek zaman aşımına uğradı'
    } else if (error?.message?.includes('fetch')) {
      message = 'Sunucuya bağlanılamıyor'
    }

    return handleError(error, {
      showToast: true,
      logError: true,
      context,
      fallbackMessage: message
    })
  }, [handleError])

  // Validation error handler
  const handleValidationError = useCallback((
    error: any,
    context: string = 'Validation'
  ) => {
    let message = 'Geçersiz veri girişi'
    
    if (error?.details) {
      message = error.details.map((detail: any) => detail.message).join(', ')
    } else if (error?.errors) {
      message = Object.values(error.errors).join(', ')
    }

    return handleError(error, {
      showToast: true,
      logError: true,
      context,
      fallbackMessage: message
    })
  }, [handleError])

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError
  }
}

// Retry mechanism hook
export function useRetry(
  maxRetries: number = 3,
  delay: number = 1000
) {
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    onError?: (error: unknown, attempt: number) => void
  ): Promise<T> => {
    let lastError: unknown
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (onError) {
          onError(error, attempt)
        }

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    
    throw lastError
  }, [maxRetries, delay])

  return { executeWithRetry }
}









