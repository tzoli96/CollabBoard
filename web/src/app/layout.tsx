import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/providers'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Team Collaboration Dashboard',
    description: 'Manage teams, members, and projects efficiently',
    keywords: ['team', 'collaboration', 'project management', 'dashboard'],
    authors: [{ name: 'Team Collaboration' }],
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="hu">
        <body className={inter.className}>
        <ErrorBoundary>
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#4ade80',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </QueryProvider>
        </ErrorBoundary>
        </body>
        </html>
    )
}