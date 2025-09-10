import { AuthGuard } from '@/components/auth/AuthGuard'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50/40">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 overflow-hidden">
                        <div className="container mx-auto p-6">
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}