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
