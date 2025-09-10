'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/providers'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, LogIn } from 'lucide-react'

interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const { isAuthenticated, isLoading, login } = useAuth()

    useEffect(() => {
        // Redirect to login if not authenticated after loading
        if (!isLoading && !isAuthenticated) {
            // Optionally auto-redirect to login
            // login()
        }
    }, [isLoading, isAuthenticated, login])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size="lg" text="Hitelesítés ellenőrzése..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>
        }

        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle>Hitelesítés szükséges</CardTitle>
                        <CardDescription>
                            A tartalom megtekintéséhez be kell jelentkeznie.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={login} className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            Bejelentkezés
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <>{children}</>
}
