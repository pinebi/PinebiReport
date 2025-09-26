'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ThemeConfig {
  id?: string
  userId?: string
  themeName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  sidebarColor: string
  borderRadius: string
  fontSize: string
  fontFamily: string
  darkMode: boolean
  customCSS?: string
  isActive: boolean
}

interface ThemeContextType {
  theme: ThemeConfig
  updateTheme: (themeData: Partial<ThemeConfig>) => Promise<void>
  applyTheme: (themeConfig: ThemeConfig) => void
  resetToDefault: () => void
  isLoading: boolean
}

const defaultTheme: ThemeConfig = {
  themeName: 'light',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  sidebarColor: '#f8fafc',
  borderRadius: '0.5rem',
  fontSize: '14px',
  fontFamily: 'Inter',
  darkMode: false,
  isActive: true
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserTheme()
  }, [])

  const loadUserTheme = async () => {
    try {
      // Check if user is logged in
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) {
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(user)
      const response = await fetch('/api/user-theme', {
        headers: {
          'Authorization': `Bearer ${Buffer.from(`${userData.id}:${token}`).toString('base64')}`
        }
      })
      
      if (response.ok) {
        const themeData = await response.json()
        if (themeData.success && themeData.theme) {
          setTheme(themeData.theme)
          applyTheme(themeData.theme)
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', themeConfig.primaryColor)
    root.style.setProperty('--secondary-color', themeConfig.secondaryColor)
    root.style.setProperty('--accent-color', themeConfig.accentColor)
    root.style.setProperty('--background-color', themeConfig.backgroundColor)
    root.style.setProperty('--text-color', themeConfig.textColor)
    root.style.setProperty('--sidebar-color', themeConfig.sidebarColor)
    root.style.setProperty('--border-radius', themeConfig.borderRadius)
    root.style.setProperty('--font-size', themeConfig.fontSize)
    root.style.setProperty('--font-family', themeConfig.fontFamily)
    
    // Apply dark mode class
    if (themeConfig.darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }

    // Apply custom CSS if provided
    let customStyle = document.getElementById('custom-theme-style')
    if (themeConfig.customCSS) {
      if (!customStyle) {
        customStyle = document.createElement('style')
        customStyle.id = 'custom-theme-style'
        document.head.appendChild(customStyle)
      }
      customStyle.textContent = themeConfig.customCSS
    } else if (customStyle) {
      customStyle.remove()
    }
  }

  const updateTheme = async (themeData: Partial<ThemeConfig>) => {
    try {
      const newTheme = { ...theme, ...themeData }
      
      // Check if user is logged in
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (!user || !token) {
        // Store in localStorage for non-logged users
        localStorage.setItem('theme', JSON.stringify(newTheme))
        setTheme(newTheme)
        applyTheme(newTheme)
        return
      }

      const userData = JSON.parse(user)
      const response = await fetch('/api/user-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(`${userData.id}:${token}`).toString('base64')}`
        },
        body: JSON.stringify(newTheme),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTheme(newTheme)
          applyTheme(newTheme)
        }
      } else {
        console.error('Failed to update theme')
      }
    } catch (error) {
      console.error('Error updating theme:', error)
    }
  }

  const resetToDefault = async () => {
    await updateTheme(defaultTheme)
  }

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      updateTheme, 
      applyTheme, 
      resetToDefault, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
