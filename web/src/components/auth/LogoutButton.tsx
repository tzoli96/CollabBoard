'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/providers'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LogoutButton({ variant = 'outline', size = 'md', className }: LogoutButtonProps) {
    const { logout, isLoading } = useAuth()

    return (
        <Button
            onClick={logout}
            disabled={isLoading}
            variant={variant}
            size={size}
            className={className}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Kijelentkezés
        </Button>
    )
}