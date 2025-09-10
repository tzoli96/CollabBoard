'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/providers'
import { useRouter } from 'next/navigation'
import { LoginButton } from '@/components/auth/LoginButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (isAuthenticated) {
        return null // Will redirect
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
                    <CardDescription>
                        Jelentkezz be a Team Collaboration Dashboard használatához
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginButton className="w-full" />
                </CardContent>
            </Card>
        </div>
    )
}