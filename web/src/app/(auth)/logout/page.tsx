'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/providers'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function LogoutPage() {
    const { logout, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated) {
            logout()
        }
    }, [isAuthenticated, logout])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" text="Kijelentkezés..." />
        </div>
    )
}