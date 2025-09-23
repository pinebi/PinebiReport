'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  username: string
  role: 'admin' | 'reporter'
  name: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    // Always set loading to false after checking
    setLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic based on authentication and permissions
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login')
      } else if (user && pathname === '/login') {
        // Redirect based on role after login
        if (user.role === 'admin') {
          router.push('/')
        } else if (user.role === 'reporter') {
          router.push('/reports/dashboard')
        }
      } else if (user && user.role === 'reporter') {
        // Check if reporter is trying to access admin pages
        const allowedPaths = ['/reports/run', '/reports/categories', '/reports/dashboard', '/reports/category']
        const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path))
        
        if (!isAllowedPath && pathname !== '/') {
          router.push('/reports/dashboard')
        }
      }
    }
  }, [user, loading, pathname, router])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes('all') || user.permissions.includes(permission)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
