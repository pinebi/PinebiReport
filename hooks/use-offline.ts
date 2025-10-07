'use client'

import { useState, useEffect, useCallback } from 'react'

interface OfflineData {
  key: string
  data: any
  timestamp: number
  expiresAt?: number
}

interface OfflineOptions {
  maxAge?: number // in milliseconds
  storageKey?: string
  syncOnOnline?: boolean
}

export function useOffline(options: OfflineOptions = {}) {
  const {
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    storageKey = 'pinebi-offline-cache',
    syncOnOnline = true
  } = options

  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<Map<string, OfflineData>>(new Map())
  const [pendingSync, setPendingSync] = useState<Array<{key: string, data: any}>>([])

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Online - syncing data...')
      syncPendingData()
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📴 Offline - using cached data')
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load cached data from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsedData = JSON.parse(cached)
        const dataMap = new Map<string, OfflineData>()
        
        Object.entries(parsedData).forEach(([key, value]: [string, any]) => {
          // Check if data is expired
          if (value.expiresAt && Date.now() > value.expiresAt) {
            return // Skip expired data
          }
          dataMap.set(key, value as OfflineData)
        })
        
        setOfflineData(dataMap)
        console.log('📦 Loaded cached data:', dataMap.size, 'items')
      }
    } catch (error) {
      console.error('❌ Failed to load cached data:', error)
    }
  }, [storageKey])

  // Save data to cache
  const saveToCache = useCallback((key: string, data: any, customMaxAge?: number) => {
    const expiresAt = Date.now() + (customMaxAge || maxAge)
    const offlineDataItem: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt
    }

    setOfflineData(prev => {
      const newMap = new Map(prev)
      newMap.set(key, offlineDataItem)
      return newMap
    })

    // Save to localStorage
    try {
      const allCachedData: Record<string, OfflineData> = {}
      offlineData.forEach((value, key) => {
        allCachedData[key] = value
      })
      allCachedData[key] = offlineDataItem
      
      localStorage.setItem(storageKey, JSON.stringify(allCachedData))
      console.log('💾 Cached data for key:', key)
    } catch (error) {
      console.error('❌ Failed to save to cache:', error)
    }
  }, [offlineData, maxAge, storageKey])

  // Get data from cache
  const getFromCache = useCallback((key: string): any | null => {
    const cached = offlineData.get(key)
    if (!cached) return null

    // Check if expired
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      // Remove expired data
      setOfflineData(prev => {
        const newMap = new Map(prev)
        newMap.delete(key)
        return newMap
      })
      return null
    }

    return cached.data
  }, [offlineData])

  // Fetch data with offline support
  const fetchWithOffline = useCallback(async (
    key: string,
    fetchFn: () => Promise<any>,
    options: { fallbackToCache?: boolean, customMaxAge?: number } = {}
  ) => {
    const { fallbackToCache = true, customMaxAge } = options

    try {
      if (isOnline) {
        // Try to fetch fresh data
        const data = await fetchFn()
        saveToCache(key, data, customMaxAge)
        return data
      } else {
        // Offline - try to get from cache
        if (fallbackToCache) {
          const cachedData = getFromCache(key)
          if (cachedData) {
            console.log('📦 Using cached data for:', key)
            return cachedData
          }
        }
        throw new Error('No cached data available and offline')
      }
    } catch (error) {
      console.error('❌ Fetch failed:', error)
      
      if (fallbackToCache) {
        const cachedData = getFromCache(key)
        if (cachedData) {
          console.log('📦 Fallback to cached data for:', key)
          return cachedData
        }
      }
      
      throw error
    }
  }, [isOnline, saveToCache, getFromCache])

  // Queue data for sync when online
  const queueForSync = useCallback((key: string, data: any) => {
    setPendingSync(prev => [...prev, { key, data }])
    console.log('⏳ Queued for sync:', key)
  }, [])

  // Sync pending data when online
  const syncPendingData = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0) return

    console.log('🔄 Syncing pending data:', pendingSync.length, 'items')
    
    for (const item of pendingSync) {
      try {
        // Here you would implement your sync logic
        // For now, we'll just save to cache
        saveToCache(item.key, item.data)
      } catch (error) {
        console.error('❌ Sync failed for:', item.key, error)
      }
    }
    
    setPendingSync([])
    console.log('✅ Sync completed')
  }, [isOnline, pendingSync, saveToCache])

  // Clear expired data
  const clearExpiredData = useCallback(() => {
    const now = Date.now()
    setOfflineData(prev => {
      const newMap = new Map(prev)
      let removedCount = 0
      
      newMap.forEach((value, key) => {
        if (value.expiresAt && now > value.expiresAt) {
          newMap.delete(key)
          removedCount++
        }
      })
      
      if (removedCount > 0) {
        console.log('🗑️ Removed expired data:', removedCount, 'items')
        
        // Update localStorage
        try {
          const allCachedData: Record<string, OfflineData> = {}
          newMap.forEach((value, key) => {
            allCachedData[key] = value
          })
          localStorage.setItem(storageKey, JSON.stringify(allCachedData))
        } catch (error) {
          console.error('❌ Failed to update localStorage:', error)
        }
      }
      
      return newMap
    })
  }, [storageKey])

  // Clear all cached data
  const clearAllCache = useCallback(() => {
    setOfflineData(new Map())
    setPendingSync([])
    try {
      localStorage.removeItem(storageKey)
      console.log('🗑️ Cleared all cached data')
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
    }
  }, [storageKey])

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const now = Date.now()
    let totalSize = 0
    let expiredCount = 0
    
    offlineData.forEach((value) => {
      totalSize += JSON.stringify(value).length
      if (value.expiresAt && now > value.expiresAt) {
        expiredCount++
      }
    })

    return {
      totalItems: offlineData.size,
      expiredItems: expiredCount,
      pendingSync: pendingSync.length,
      totalSize: totalSize,
      oldestItem: offlineData.size > 0 ? 
        Math.min(...Array.from(offlineData.values()).map(v => v.timestamp)) : 0
    }
  }, [offlineData, pendingSync])

  return {
    isOnline,
    offlineData: Array.from(offlineData.values()),
    pendingSync,
    saveToCache,
    getFromCache,
    fetchWithOffline,
    queueForSync,
    syncPendingData,
    clearExpiredData,
    clearAllCache,
    getCacheStats
  }
}

// Offline-enabled API hook
export function useOfflineAPI<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: OfflineOptions & { 
    fallbackToCache?: boolean
    customMaxAge?: number
    refetchInterval?: number
  } = {}
) {
  const {
    fallbackToCache = true,
    customMaxAge,
    refetchInterval,
    ...offlineOptions
  } = options

  const { fetchWithOffline, isOnline } = useOffline(offlineOptions)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchWithOffline(key, fetchFn, {
        fallbackToCache,
        customMaxAge
      })
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn, fetchWithOffline, fallbackToCache, customMaxAge])

  useEffect(() => {
    fetchData()

    if (refetchInterval && isOnline) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval, isOnline])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isOnline
  }
}