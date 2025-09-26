'use client'

import { useState, useEffect } from 'react'
import { X, FileText, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportConfig } from '@/types'

interface ReportTab {
  id: string
  report: ReportConfig
  data?: any[]
  loading?: boolean
  error?: string
}

interface ReportTabsProps {
  tabs: ReportTab[]
  activeTabId: string | null
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabOpen: (report: ReportConfig) => void
}

export function ReportTabs({ 
  tabs, 
  activeTabId, 
  onTabChange, 
  onTabClose, 
  onTabOpen 
}: ReportTabsProps) {
  if (tabs.length === 0) return null

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center gap-2 px-4 py-3 border-r border-gray-200 cursor-pointer
              transition-colors min-w-0 flex-shrink-0
              ${activeTabId === tab.id 
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }
            `}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {tab.loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : tab.error ? (
                <X className="w-4 h-4 text-red-500" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              
              <span className="text-sm font-medium truncate max-w-32">
                {tab.report.name}
              </span>
              
              {tab.data && tab.data.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {tab.data.length}
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
