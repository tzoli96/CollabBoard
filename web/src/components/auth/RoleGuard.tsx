'use client'

import { useAuth } from '@/lib/auth/providers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'

interface RoleGuardProps {
    children: React.ReactNode
    roles: string[]
    fallback?: React.ReactNode
    mode?: 'any' | 'all' // 'any' = has any of the roles, 'all' = has all roles
}

export function RoleGuard({
                              children,
                              roles,
                              fallback,
                              mode = 'any'
                          }: RoleGuardProps) {
    const { hasRole, hasAnyRole } = useAuth()

    const hasRequiredRole = mode === 'any'
        ? hasAnyRole(roles)
        : roles.every(role => hasRole(role))

    if (!hasRequiredRole) {
        if (fallback) {
            return <>{fallback}</>
        }

        return (
            <Alert className="my-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                    Nincs jogosultságod ehhez a funkcióhoz. Szükséges szerepkör(ök): {roles.join(', ')}
                </AlertDescription>
            </Alert>
        )
    }

    return <>{children}</>
}