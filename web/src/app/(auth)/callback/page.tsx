'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { keycloak } from '@/lib/auth/keycloak'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Keycloak will handle the callback automatically
                // Just redirect to dashboard
                router.push('/dashboard')
            } catch (error) {
                console.error('Auth callback error:', error)
                router.push('/')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" text="Hitelesítés folyamatban..." />
        </div>
    )
}