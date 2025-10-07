import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { DashboardProvider } from '@/contexts/DashboardContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pinebi Report',
  description: 'Pinebi Report - Gelişmiş raporlama ve analiz sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pinebi Report'
  },
  other: {
    'mobile-web-app-capable': 'yes'
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#00568C'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className} suppressHydrationWarning={true}>
      <AuthProvider>
        <ThemeProvider>
          <DashboardProvider>
            <ToastProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </ToastProvider>
          </DashboardProvider>
        </ThemeProvider>
      </AuthProvider>
      </body>
    </html>
  )
}
