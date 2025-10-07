'use client'

import React, { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'

export function PWAUpdateBanner() {
  const { updateAvailable, updateApp } = usePWA()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setShowBanner(true)
    }
  }, [updateAvailable])

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#00568C] text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#A7F300] rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-[#00568C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <p className="font-semibold">Güncelleme Mevcut</p>
          <p className="text-sm opacity-90">Yeni özellikler için uygulamayı güncelleyin</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowBanner(false)}
          className="px-3 py-1 text-sm bg-white/20 rounded hover:bg-white/30 transition-colors"
        >
          Daha Sonra
        </button>
        <button
          onClick={() => {
            updateApp()
            setShowBanner(false)
          }}
          className="px-3 py-1 text-sm bg-[#A7F300] text-[#00568C] rounded hover:bg-[#90E000] transition-colors font-semibold"
        >
          Güncelle
        </button>
      </div>
    </div>
  )
}






