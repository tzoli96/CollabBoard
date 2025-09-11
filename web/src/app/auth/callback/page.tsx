'use client'

import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function AuthCallbackPage() {
    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('Auth callback triggered')
                console.log('Current URL:', window.location.href)

                // Check if we're in an iframe (silent SSO)
                if (window.parent && window.parent !== window) {
                    console.log('Running in iframe - silent SSO callback')

                    // Parse URL parameters for iframe context too
                    const fragment = new URLSearchParams(window.location.hash.substring(1))
                    const error = fragment.get('error')

                    if (error) {
                        console.log('Silent SSO error:', error)
                        // For silent SSO errors, let Keycloak handle it
                        // This will inform the parent window that silent SSO failed
                        return
                    }

                    // If no error, let Keycloak handle the successful callback
                    return
                }

                // Regular login callback logic (rest of the code remains the same)
                console.log('Regular login callback - redirecting to dashboard')

                const urlParams = new URLSearchParams(window.location.search)
                const fragment = new URLSearchParams(window.location.hash.substring(1))

                const code = urlParams.get('code') || fragment.get('code')
                const error = urlParams.get('error') || fragment.get('error')

                if (error) {
                    console.error('Auth error:', error)
                    window.location.href = '/'
                    return
                }

                if (code) {
                    console.log('Authorization code received, redirecting to dashboard')
                    window.location.href = '/dashboard'
                } else {
                    console.log('No authorization code, redirecting to home')
                    window.location.href = '/'
                }

            } catch (error) {
                console.error('Auth callback error:', error)
                window.location.href = '/'
            }
        }

        const timer = setTimeout(handleCallback, 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" text="Hitelesítés folyamatban..." />
        </div>
    )
}