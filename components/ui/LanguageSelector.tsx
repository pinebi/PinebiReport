'use client'

import React from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  className?: string
  variant?: 'select' | 'buttons'
  showLabel?: boolean
}

export function LanguageSelector({ 
  className, 
  variant = 'select',
  showLabel = false 
}: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, isLoading } = useI18n()

  const currentLanguage = availableLanguages.find(lang => lang.code === language)

  if (variant === 'buttons') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dil:
          </span>
        )}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {availableLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "ghost"}
              size="sm"
              onClick={() => setLanguage(lang.code)}
              disabled={isLoading}
              className="h-8 px-3 flex items-center gap-2"
            >
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {language === lang.code && !isLoading && (
                <Check className="w-3 h-3" />
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dil:
        </span>
      )}
      <Select
        value={language}
        onValueChange={setLanguage}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue>
              {currentLanguage && (
                <div className="flex items-center gap-2">
                  <span>{currentLanguage.flag}</span>
                  <span className="hidden sm:inline">{currentLanguage.name}</span>
                </div>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}







