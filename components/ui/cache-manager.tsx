'use client'

import { useOffline } from '@/hooks/use-offline'

export function CacheManager() {
  const { 
    getCacheStats, 
    clearExpiredData, 
    clearAllCache,
    syncPendingData,
    isOnline,
    pendingSync
  } = useOffline()

  const stats = getCacheStats()

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Önbellek Yönetimi</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Toplam Öğe</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.expiredItems}</div>
          <div className="text-sm text-gray-600">Süresi Dolmuş</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{pendingSync.length}</div>
          <div className="text-sm text-gray-600">Senkron Bekleyen</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(stats.totalSize / 1024)}KB
          </div>
          <div className="text-sm text-gray-600">Toplam Boyut</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={clearExpiredData}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm"
        >
          Süresi Dolanları Temizle
        </button>
        <button
          onClick={clearAllCache}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
        >
          Tümünü Temizle
        </button>
      </div>

      {pendingSync.length > 0 && isOnline && (
        <button
          onClick={syncPendingData}
          className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
        >
          Bekleyen Verileri Senkronize Et ({pendingSync.length})
        </button>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Durum:</span>
          <span className={isOnline ? 'text-green-600' : 'text-orange-600'}>
            {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </span>
        </div>
      </div>
    </div>
  )
}






