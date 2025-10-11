'use client'

import React from 'react'
import { usePWA } from '@/hooks/use-pwa'

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA()

  if (isInstalled || isStandalone || !isInstallable) {
    return null
  }

  return (
    <button
      onClick={installApp}
      className="bg-[#A7F300] hover:bg-[#90E000] text-[#00568C] font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Uygulamayı Yükle
    </button>
  )
}













