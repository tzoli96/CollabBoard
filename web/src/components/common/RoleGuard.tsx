'use client';

import { useAuth } from '@/lib/auth/providers';
import { ReactNode } from 'react';

interface RoleGuardProps {
    children: ReactNode;
    roles: string[];
    fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
    const { hasRole } = useAuth();

    const hasRequiredRole = roles.some(role => hasRole(role));

    if (!hasRequiredRole) {
        return fallback || <div>Nincs jogosultságod ehhez a funkcióhoz.</div>;
    }

    return <>{children}</>;
}